import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    await connectDB();

    let orders = [];
    if (authUser.role === 'admin') {
      orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ user: authUser.userId }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      discountAmount,
      totalPrice,
    } = await request.json();

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ success: false, message: 'No order items provided' }, { status: 400 });
    }

    const conn = await connectDB();

    // ATOMIC stock deduction — prevents race condition overselling
    for (const item of orderItems) {
      if (!item.product || item.product.length !== 24) continue;
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } }, // atomic check + deduct
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) {
        return NextResponse.json(
          { success: false, message: `"${item.name}" is out of stock or insufficient quantity available.` },
          { status: 400 }
        );
      }
    }

    const order = await Order.create({
      user: authUser.userId,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Credit Card (Mock)',
      itemsPrice: parseFloat(itemsPrice),
      shippingPrice: parseFloat(shippingPrice || 0),
      discountAmount: parseFloat(discountAmount || 0),
      totalPrice: parseFloat(totalPrice),
      isPaid: true,
      paidAt: new Date(),
      status: 'Processing',
      invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    // Send order details to Google Sheet if Webhook URL is configured
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        const productSummary = orderItems
          .map((i) => `${i.name} (Qty: ${i.quantity}, Size: ${i.size}, Color: ${i.color || 'N/A'})`)
          .join('; ');

        fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
