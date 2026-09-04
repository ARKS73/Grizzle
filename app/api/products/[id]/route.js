import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/jwt';
import { getCachedData, setCachedData, clearStoreCache } from '@/lib/storeCache';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const cacheKey = `product_detail_${id}`;
    const cachedProduct = getCachedData(cacheKey);

    if (cachedProduct) {
      return NextResponse.json({ success: true, product: cachedProduct });
    }

    await connectDB();

    let product = null;
    if (id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      product = await Product.findById(id).lean();
    }

    if (!product) {
      product = await Product.findOne({ slug: id }).lean();
    }

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    setCachedData(cacheKey, product, 60000);

    return NextResponse.json(
      { success: true, product },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    // Strip immutable fields to prevent MongoDB "_id modification" errors
    const { _id, createdAt, updatedAt, ...updateData } = body;

    await connectDB();

    let updatedProduct = null;

    if (id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: false,
      }).lean();
    }

    if (!updatedProduct) {
      return NextResponse.json({ success: false, message: 'Product not found in database' }, { status: 404 });
    }

    clearStoreCache();

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Update Product API Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    await connectDB();

    if (id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      await Product.findByIdAndDelete(id);
    }

    clearStoreCache();

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
