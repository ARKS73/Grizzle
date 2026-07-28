import { NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { getAuthUser } from '@/lib/jwt';

export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { file, folder } = await request.json();
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file image data provided' }, { status: 400 });
    }

    const result = await uploadImageToCloudinary(file, folder || 'grizzle_products');

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Image Upload API Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
