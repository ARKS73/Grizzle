import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

// GET /api/cart - Fetch logged-in user's cart from MongoDB
export async function GET(request) {
  try {
    const authPayload = getAuthUser(request);
    if (!authPayload || !authPayload.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthenticated', cartItems: [] },
        { status: 200 }
      );
    }

    await connectDB();
    const user = await User.findById(authPayload.userId).populate('cart.product');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found', cartItems: [] },
        { status: 404 }
      );
    }

    const validCartItems = (user.cart || [])
      .filter((item) => item.product && item.product._id)
      .map((item) => ({
        product: item.product,
        size: item.size || 'M',
        color: item.color || 'Default',
        quantity: item.quantity || 1,
      }));

    return NextResponse.json({
      success: true,
      cartItems: validCartItems,
    });
  } catch (error) {
    console.error('Fetch Cart API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message, cartItems: [] },
      { status: 500 }
    );
  }
}

// POST /api/cart - Sync current cart items to MongoDB for logged-in user
export async function POST(request) {
  try {
    const authPayload = getAuthUser(request);
    if (!authPayload || !authPayload.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    }

    const { cartItems } = await request.json();

    if (!Array.isArray(cartItems)) {
      return NextResponse.json(
        { success: false, message: 'cartItems must be an array' },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(authPayload.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const mappedCart = cartItems
      .filter((item) => item.product && (item.product._id || item.product))
      .map((item) => ({
        product: item.product._id || item.product,
        size: item.size || 'M',
        color: item.color || 'Default',
        quantity: Math.max(1, parseInt(item.quantity || 1)),
      }));

    user.cart = mappedCart;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Cart synced successfully',
      count: user.cart.length,
    });
  } catch (error) {
    console.error('Sync Cart API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
