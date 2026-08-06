import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/jwt';
import { clearStoreCache } from '@/lib/storeCache';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    await connectDB();

    let reviews;
    let canReview = false;

    if (productId) {
      reviews = await Review.find({ product: productId })
        .sort({ createdAt: -1 })
        .limit(limit);

      const authUser = getAuthUser(request);
      if (authUser && authUser.userId) {
        const deliveredOrder = await Order.findOne({
          user: authUser.userId,
          'orderItems.product': productId,
          status: 'Delivered',
        });
        canReview = Boolean(deliveredOrder);
      }
    } else {
      // Global reviews feed across all products
      reviews = await Review.find({})
        .populate('product', 'name images category price')
        .sort({ createdAt: -1 })
        .limit(limit);
    }

    return NextResponse.json({ success: true, reviews, canReview });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Please log in to submit a review' }, { status: 401 });
    }

    const { productId, rating, title, comment } = await request.json();
    if (!productId || !rating || !comment) {
      return NextResponse.json({ success: false, message: 'Rating and review comment are required' }, { status: 400 });
    }

    await connectDB();

    // Verify customer purchased and received this product (Status: Delivered)
    const userOrder = await Order.findOne({
      user: authUser.userId,
      'orderItems.product': productId,
      status: 'Delivered',
    });

    if (!userOrder) {
      return NextResponse.json({
        success: false,
        message: 'Only verified customers who have purchased and received this product (Delivered) can post a review.',
      }, { status: 403 });
    }

    const review = await Review.create({
      product: productId,
      user: authUser.userId,
      userName: authUser.name,
      rating: parseInt(rating, 10),
      title: title || '',
      comment,
      isVerifiedPurchase: true,
    });

    // Update Product average ratings
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      ratings: Math.round(avgRating * 10) / 10,
      numReviews: allReviews.length,
    });

    clearStoreCache();

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully!',
      review,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
