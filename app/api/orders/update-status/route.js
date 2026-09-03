import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { handleOrderStatusStockAdjustment } from '@/utils/stockHelper';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { orderId, invoiceNumber, status } = await request.json();

    if (!status || (!orderId && !invoiceNumber)) {
      return NextResponse.json(
        { success: false, message: 'Missing status, orderId, or invoiceNumber' },
        { status: 400 }
      );
    }

    const VALID_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value' },
        { status: 400 }
      );
    }

    await connectDB();

    let order = null;
    if (orderId && orderId.length === 24) {
      order = await Order.findById(orderId);
    }
    if (!order && invoiceNumber) {
      order = await Order.findOne({ invoiceNumber: invoiceNumber.trim() });
    }

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const previousStatus = order.status;
    order.status = status;
    await handleOrderStatusStockAdjustment(order, previousStatus, status);
    await order.save();

    console.log(`[Google Sheet Sync] Order ${order.invoiceNumber} status updated to: ${status}`);

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      orderId: order._id,
      invoiceNumber: order.invoiceNumber,
      status: order.status,
    });
  } catch (error) {
    console.error('Update status webhook error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
