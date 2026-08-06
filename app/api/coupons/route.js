import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { getAuthUser } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    await connectDB();

    if (code) {
      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        expirationDate: { $gte: new Date() },
      });

      if (!coupon) {
        return NextResponse.json({ success: false, message: 'Invalid or expired coupon code' }, { status: 404 });
      }

      // If one-time per customer coupon, check customer's order history
      if (coupon.isOneTimePerUser) {
        const authUser = getAuthUser(request);
        if (authUser && (authUser.userId || authUser._id)) {
          const userIdStr = (authUser.userId || authUser._id).toString();
          const OrderModel = (await import('@/models/Order')).default;
          
          const orConditions = [{ user: userIdStr }];
          if (authUser.email) {
            orConditions.push({ 'shippingAddress.email': authUser.email.toLowerCase() });
          }

          const existingOrder = await OrderModel.findOne({
            $or: orConditions,
            couponCode: coupon.code.toUpperCase(),
            status: { $ne: 'Cancelled' },
          });

          if (existingOrder) {
            return NextResponse.json({
              success: false,
              message: `Coupon "${coupon.code}" is valid for 1-time use only and has already been redeemed on your previous order.`,
            }, { status: 400 });
          }
        }
      }

      return NextResponse.json({ success: true, coupon });
    }

    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { code, discountType, discountValue, minPurchase, expirationDate, isOneTimePerUser } = await request.json();
    if (!code || !discountValue) {
      return NextResponse.json({ success: false, message: 'Code and discount value required' }, { status: 400 });
    }

    await connectDB();
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType: discountType || 'percentage',
      discountValue: parseFloat(discountValue),
      minPurchase: parseFloat(minPurchase || 0),
      expirationDate: expirationDate ? new Date(expirationDate) : new Date('2028-12-31'),
      isOneTimePerUser: Boolean(isOneTimePerUser),
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
