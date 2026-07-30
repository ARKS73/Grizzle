import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

// GET all users (Admin only)
export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST — Create a new user or admin directly from Admin Panel (stored in MongoDB)
export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { name, email, password, phone, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'A user with this email already exists in the database' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      role: role === 'admin' ? 'admin' : 'customer',
    });

    return NextResponse.json({
      success: true,
      message: `${role === 'admin' ? 'Admin' : 'Customer'} account created and stored in MongoDB!`,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Create User Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH — Update user role / block status
export async function PATCH(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { userId, isBlocked, role } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (isBlocked !== undefined) user.isBlocked = isBlocked;
    if (role) user.role = role;

    await user.save();

    return NextResponse.json({
      success: true,
      message: `User updated in MongoDB`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE — Remove user from MongoDB
export async function DELETE(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    await connectDB();
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true, message: 'User deleted from MongoDB' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
