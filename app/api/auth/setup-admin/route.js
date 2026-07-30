import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, COOKIE_NAME } from '@/lib/jwt';

// POST /api/auth/setup-admin
// Creates the very first admin account if no admin exists yet in MongoDB.
// This is only callable when the database has ZERO admin accounts.
export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are all required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Safety check: only allow this if there are NO admins in MongoDB yet
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: 'An admin account already exists in MongoDB. Log in at /login to access the admin panel.',
        },
        { status: 403 }
      );
    }

    // Also check email uniqueness
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'This email is already registered in MongoDB' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin',
      phone: '',
    });

    // Auto-login the new admin
    const token = signToken({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Admin account created and saved to MongoDB! You are now logged in.',
      user: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Setup Admin Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET — check if any admin exists
export async function GET() {
  try {
    await connectDB();
    const adminExists = await User.exists({ role: 'admin' });
    return NextResponse.json({ success: true, adminExists: !!adminExists });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
