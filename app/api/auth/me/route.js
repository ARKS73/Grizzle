import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authPayload = getAuthUser(request);
    if (!authPayload || !authPayload.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    let user = null;
    if (authPayload.userId && authPayload.userId.length === 24 && /^[0-9a-fA-F]{24}$/.test(authPayload.userId)) {
      user = await User.findById(authPayload.userId).select('-password');
    }
    if (!user && authPayload.email) {
      user = await User.findOne({ email: authPayload.email.toLowerCase() }).select('-password');
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const authPayload = getAuthUser(request);
    if (!authPayload) {
      return NextResponse.json(
        { success: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    }

    const { name, phone, address, profileImage } = await request.json();

    await connectDB();
    let user = null;
    if (authPayload.userId && authPayload.userId.length === 24 && /^[0-9a-fA-F]{24}$/.test(authPayload.userId)) {
      user = await User.findById(authPayload.userId);
    }
    if (!user && authPayload.email) {
      user = await User.findOne({ email: authPayload.email.toLowerCase() });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;
    if (address) {
      user.address = {
        street: address.street !== undefined ? address.street : user.address?.street,
        city: address.city !== undefined ? address.city : user.address?.city,
        state: address.state !== undefined ? address.state : user.address?.state,
        postalCode: address.postalCode !== undefined ? address.postalCode : user.address?.postalCode,
        country: address.country !== undefined ? address.country : user.address?.country,
      };
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
