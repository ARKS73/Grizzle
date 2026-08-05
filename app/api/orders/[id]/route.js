import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    await connectDB();

    let order = null;
    if (id && id.length === 24) {
      order = await Order.findById(id).populate('user', 'name email phone');
    }
    if (!order && id) {
      order = await Order.findOne({ invoiceNumber: id }).populate('user', 'name email phone');
    }

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    const { id } = params;
    const { status } = await request.json();

    await connectDB();
    let order = null;
    if (id && id.length === 24) {
      order = await Order.findById(id);
    }
    if (!order && id) {
      order = await Order.findOne({ invoiceNumber: id });
    }

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const VALID_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const CUSTOMER_ALLOWED_STATUSES = ['Cancelled'];

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ success: false, message: 'Invalid status value' }, { status: 400 });
      }
      const isAdmin = authUser && (authUser.role === 'admin' || authUser.email?.toLowerCase() === 'grizzlein@gmail.com');
      if (!isAdmin && !CUSTOMER_ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json({ success: false, message: 'Customers can only cancel orders' }, { status: 403 });
      }
      if (!isAdmin && !['Pending', 'Processing'].includes(order.status)) {
        return NextResponse.json({ success: false, message: 'This order cannot be cancelled at its current stage' }, { status: 400 });
      }
      order.status = status;
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${order.status}`,
      order,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
