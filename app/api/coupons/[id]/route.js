import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { getAuthUser } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

// PATCH /api/coupons/[id] - Toggle active/deactivated or update coupon
export async function PATCH(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    await connectDB();

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }

    if (typeof body.isActive === 'boolean') {
      coupon.isActive = body.isActive;
    } else {
      coupon.isActive = !coupon.isActive;
    }

    await coupon.save();

    return NextResponse.json({
      success: true,
      message: `Coupon ${coupon.code} is now ${coupon.isActive ? 'Active' : 'Deactivated'}`,
      coupon,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/coupons/[id] - Delete coupon
export async function DELETE(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    await connectDB();
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
