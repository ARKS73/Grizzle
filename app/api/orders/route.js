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

    // Deduct stock automatically for real product IDs
    if (conn) {
      for (const item of orderItems) {
        if (item.product && item.product.length === 24) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock = Math.max(0, product.stock - item.quantity);
            await product.save();
          }
        }
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
