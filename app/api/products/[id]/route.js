import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/jwt';
import { seedProducts } from '@/lib/seedData';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    await connectDB();

    let product = null;
    if (id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      product = await Product.findById(id);
    }

    if (!product) {
      // Fallback search in seedProducts for mock IDs or slugs
      product = seedProducts.find(
        (p, idx) => `mock_${idx}` === id || p.slug === id || p._id === id
      );
      if (product) {
        product = { ...product, _id: id };
      }
    }

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
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

    // Strip immutable fields to prevent MongoDB "Modifying _id is not allowed" error
    const { _id, createdAt, updatedAt, ...updateData } = body;

    await connectDB();

    let updatedProduct = null;

    // Check if valid MongoDB 24-character hexadecimal ObjectId
    if (id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: false,
      });
    }

    // If item was a mock/seed product not in MongoDB yet, create a real MongoDB product entry seamlessly
    if (!updatedProduct) {
      const slug = (updateData.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      updatedProduct = await Product.create({
        ...updateData,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        price: parseFloat(updateData.price || 0),
        stock: parseInt(updateData.stock || 20, 10),
      });
    }

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

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
