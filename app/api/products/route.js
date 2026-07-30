import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const gender = searchParams.get('gender') || '';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : 0;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : 100000;
    const size = searchParams.get('size') || '';
    const color = searchParams.get('color') || '';
    const rating = searchParams.get('rating') ? parseFloat(searchParams.get('rating')) : 0;
    const isFeatured = searchParams.get('isFeatured') === 'true';
    const isTrending = searchParams.get('isTrending') === 'true';
    const isBestSeller = searchParams.get('isBestSeller') === 'true';
    const inStock = searchParams.get('inStock') === 'true';
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    await connectDB();

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All' && category !== 'ALL') {
      query.category = { $regex: new RegExp(`^${category.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') };
    }

    if (gender && gender !== 'All' && gender !== 'ALL') {
      query.gender = { $regex: new RegExp(`^${gender.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') };
    }

    if (minPrice > 0 || maxPrice < 100000) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    }

    if (size) {
      query.sizes = size;
    }

    if (color) {
      query['colors.name'] = { $regex: color, $options: 'i' };
    }

    if (rating > 0) {
      query.ratings = { $gte: rating };
    }

    if (isFeatured) query.isFeatured = true;
    if (isTrending) query.isTrending = true;
    if (isBestSeller) query.isBestSeller = true;
    if (inStock) query.stock = { $gt: 0 };

    let sortOptions = { createdAt: -1 };
    if (sort === 'price-low' || sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price-high' || sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'rating') sortOptions = { ratings: -1 };

    // Ultra-fast parallel count + query using lean documents
    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit) || 1,
      currentPage: page,
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({
      success: false,
      message: error.message,
      products: [],
      totalProducts: 0,
      totalPages: 1,
      currentPage: 1,
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      gender,
      price,
      originalPrice,
      sizes,
      colors,
      stock,
      images,
      discountPercentage,
      isFeatured,
      isTrending,
      isBestSeller,
    } = body;

    if (!name || !description || !category || !price || !images || images.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required product details and at least one image' },
        { status: 400 }
      );
    }

    await connectDB();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newProduct = await Product.create({
      name,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      description,
      category,
      gender: gender || 'Unisex',
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
      sizes: sizes && sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
      colors: colors || [{ name: 'Black', hex: '#000000' }],
      stock: parseInt(stock || '20', 10),
      images,
      discountPercentage: discountPercentage ? parseInt(discountPercentage, 10) : 0,
      isFeatured: Boolean(isFeatured),
      isTrending: Boolean(isTrending),
      isBestSeller: Boolean(isBestSeller),
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully!',
      product: newProduct,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
