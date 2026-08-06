import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    await connectDB();

    if (!authUser || (!authUser.userId && !authUser._id)) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const userIdStr = (authUser.userId || authUser._id).toString();
    const isAdmin = authUser && (authUser.role === 'admin' || authUser.email?.toLowerCase() === 'grizzlein@gmail.com');

    let orders = [];
    if (isAdmin) {
      orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    } else {
      const orConditions = [];

      if (mongoose.Types.ObjectId.isValid(userIdStr)) {
        orConditions.push({ user: new mongoose.Types.ObjectId(userIdStr) });
      }
      orConditions.push({ user: userIdStr });

      if (authUser.email) {
        orConditions.push({ 'shippingAddress.email': authUser.email.toLowerCase() });
      }

      if (authUser.phone && authUser.phone.trim() !== '') {
        orConditions.push({ 'shippingAddress.phone': authUser.phone.trim() });
      }

      if (authUser.name && authUser.name.trim() !== '') {
        orConditions.push({ 'shippingAddress.fullName': authUser.name.trim() });
      }

      orders = await Order.find({ $or: orConditions }).populate('user', 'name email').sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      discountAmount,
      couponCode,
      totalPrice,
    } = await request.json();

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ success: false, message: 'No order items provided' }, { status: 400 });
    }

    await connectDB();

    let userId = authUser ? (authUser.userId || authUser._id || authUser.id) : null;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      const User = (await import('@/models/User')).default;
      let guestUser = await User.findOne({ email: 'guest@grizzle.in' });
      if (!guestUser) {
        guestUser = await User.create({
          name: shippingAddress?.fullName || 'Guest Customer',
          email: 'guest@grizzle.in',
          password: 'guestpassword123',
          phone: shippingAddress?.phone || '',
          role: 'customer',
        });
      }
      userId = guestUser._id;
    }

    const cleanedOrderItems = orderItems.map((item) => {
      let prodId = typeof item.product === 'object' ? item.product?._id : item.product;
      return {
        product: prodId,
        name: item.name || 'Grizzle Apparel',
        image: item.image || '',
        price: parseFloat(item.price || 0),
        quantity: parseInt(item.quantity || 1, 10),
        size: item.size || 'M',
        color: item.color || 'Black',
      };
    });

    // Deduct overall stock and specific sizeStock for each ordered product item
    for (const item of cleanedOrderItems) {
      const productIdStr = item.product;
      if (!productIdStr || String(productIdStr).length !== 24) continue;

      const targetProd = await Product.findById(productIdStr);
      if (!targetProd) continue;

      const qty = item.quantity;
      const incFields = { stock: -qty };

      if (item.size && targetProd.sizeStock && targetProd.sizeStock[item.size] !== undefined) {
        incFields[`sizeStock.${item.size}`] = -qty;
      }

      await Product.findByIdAndUpdate(productIdStr, { $inc: incFields });
    }

    const { clearStoreCache } = await import('@/lib/storeCache');
    clearStoreCache();

    const order = await Order.create({
      user: userId,
      orderItems: cleanedOrderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Credit Card (Mock)',
      itemsPrice: parseFloat(itemsPrice || 0),
      shippingPrice: parseFloat(shippingPrice || 0),
      discountAmount: parseFloat(discountAmount || 0),
      couponCode: couponCode ? String(couponCode).toUpperCase() : '',
      totalPrice: parseFloat(totalPrice || 0),
      isPaid: true,
      paidAt: new Date(),
      status: 'Processing',
      invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    // Auto-update User profile in MongoDB with latest checkout delivery address & phone number
    if (authUser && (authUser.userId || authUser._id)) {
      try {
        const targetUserId = authUser.userId || authUser._id;
        const UserModel = (await import('@/models/User')).default;
        await UserModel.findByIdAndUpdate(targetUserId, {
          ...(shippingAddress.phone ? { phone: shippingAddress.phone } : {}),
          address: {
            street: shippingAddress.street || '',
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            postalCode: shippingAddress.postalCode || '',
            country: shippingAddress.country || 'India',
          },
        });
      } catch (userUpdErr) {
        console.error('Failed to update User profile address from order:', userUpdErr);
      }
    }

    // Send order details to Google Sheet if Webhook URL is configured
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        const productSummary = orderItems
          .map((i, idx) => `${idx + 1}. ${i.name}\n   [ Qty: ${i.quantity} | Size: ${i.size} | Color: ${i.color || 'Default'} ]`)
          .join('\n');

        fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          redirect: 'follow',
          body: JSON.stringify({
            orderId: order._id.toString(),
            invoiceNumber: order.invoiceNumber,
            date: new Date(order.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            customerName: shippingAddress.fullName || '',
            phone: shippingAddress.phone || '',
            street: shippingAddress.street || '',
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            postalCode: shippingAddress.postalCode || '',
            country: shippingAddress.country || 'India',
            products: productSummary,
            paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
            totalPrice: totalPrice,
            status: order.status || 'Processing',
          }),
        }).catch((err) => console.error('Google Sheet Webhook Error:', err));
      } catch (sheetErr) {
        console.error('Failed to trigger Google Sheet webhook:', sheetErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully!',
      order,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
