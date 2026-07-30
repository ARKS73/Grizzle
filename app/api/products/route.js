import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/jwt';
import { seedProducts } from '@/lib/seedData';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const gender = searchParams.get('gender') || '';
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : 0;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : 1000;
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

    const conn = await connectDB();

    let products = [];
    let totalProducts = 0;

    if (conn) {
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ];
      }

      if (category && category !== 'All') {
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }

      if (gender && gender !== 'All') {
        query.gender = { $regex: new RegExp(`^${gender}$`, 'i') };
      }

      if (minPrice > 0 || maxPrice < 1000) {
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
      if (sort === 'price-low') sortOptions = { price: 1 };
      if (sort === 'price-high') sortOptions = { price: -1 };
      if (sort === 'rating') sortOptions = { ratings: -1 };

      totalProducts = await Product.countDocuments(query);
      products = await Product.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit);
    }

    // Fallback if DB is unseeded or offline
    if (products.length === 0) {
      let mockList = seedProducts.map((p, idx) => ({ ...p, _id: p._id || `mock_${idx}` }));
      if (search) {
        const s = search.toLowerCase();
        mockList = mockList.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || (p.category && p.category.toLowerCase().includes(s)));
      }
      if (category && category !== 'All') {
        mockList = mockList.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
      }
      if (gender && gender !== 'All') {
        mockList = mockList.filter(p => p.gender && p.gender.toLowerCase() === gender.toLowerCase());
      }
      if (isFeatured) {
        mockList = mockList.filter(p => p.isFeatured);
      }
      if (isBestSeller) {
        mockList = mockList.filter(p => p.isBestSeller);
      }
      if (isTrending) {
        mockList = mockList.filter(p => p.isTrending);
      }
      if (mockList.length === 0) {
        mockList = seedProducts.map((p, idx) => ({ ...p, _id: p._id || `mock_${idx}` }));
      }
      totalProducts = mockList.length;
      products = mockList.slice((page - 1) * limit, page * limit);
    }

    return NextResponse.json({
      success: true,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit) || 1,
      currentPage: page,
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    const mockProducts = seedProducts.map((p, idx) => ({ ...p, _id: `mock_${idx}` }));
    return NextResponse.json({
      success: true,
      products: mockProducts,
      totalProducts: mockProducts.length,
      totalPages: 1,
      currentPage: 1,
    });
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
