import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { getAuthUser } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const conn = await connectDB();
    let categories = [];
    if (conn) {
      categories = await Category.find({}).sort({ name: 1 }).lean();
    }
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    return NextResponse.json({ success: true, categories: [] });
  }
}

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { name, image, description } = await request.json();
    if (!name) {
      return NextResponse.json({ success: false, message: 'Category name is required' }, { status: 400 });
    }

    await connectDB();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = await Category.create({ name, slug, image, description });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
