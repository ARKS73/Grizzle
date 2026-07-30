import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    const { id } = params;
    await connectDB();

    const order = await Order.findById(id).populate('user', 'name email phone');
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Verify ownership unless admin
    if (authUser.role !== 'admin' && order.user._id.toString() !== authUser.userId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Customer can cancel if pending/processing; Admin can change to any status
    if (authUser.role !== 'admin' && order.user.toString() !== authUser.userId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const VALID_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const CUSTOMER_ALLOWED_STATUSES = ['Cancelled'];

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ success: false, message: 'Invalid status value' }, { status: 400 });
      }
      if (authUser.role !== 'admin' && !CUSTOMER_ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json({ success: false, message: 'Customers can only cancel orders' }, { status: 403 });
      }
      if (authUser.role !== 'admin' && !['Pending', 'Processing'].includes(order.status)) {
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
