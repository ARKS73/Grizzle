import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, COOKIE_NAME } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide both email and password' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { success: false, message: 'Your account has been suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // Check if account is temporarily locked due to 5 consecutive failed attempts
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.lockUntil).getTime() - Date.now()) / (1000 * 60));
      return NextResponse.json(
        {
          success: false,
          message: `Account is temporarily locked due to 5 consecutive failed login attempts. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`,
        },
        { status: 429 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || 0) + 1;

      if (attempts >= 5) {
        user.failedLoginAttempts = 0;
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
        await user.save();

        return NextResponse.json(
          {
            success: false,
            message: 'Too many failed login attempts. Your account has been locked for 15 minutes for security protection.',
          },
          { status: 429 }
        );
      } else {
        user.failedLoginAttempts = attempts;
        await user.save();

        const remaining = 5 - attempts;
        return NextResponse.json(
          {
            success: false,
            message: `Invalid email or password. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining before account lockout.`,
          },
          { status: 401 }
        );
      }
    }

    // Reset lockout counters on successful password match
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    if (user.role === 'admin' && user.isMfaEnabled) {
      // Issue a 5-minute temporary MFA pending token (does NOT grant full site access)
      const mfaTempToken = signToken({
        userId: user._id.toString(),
        email: user.email,
        role: 'admin_mfa_pending',
      });

      return NextResponse.json({
        success: true,
        requiresMfa: true,
        tempToken: mfaTempToken,
        message: 'Security Verification Required: Enter the 6-digit code from your Authenticator App',
      });
    }

    const userPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = signToken(userPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      requiresMfaSetup: user.role === 'admin' && !user.isMfaEnabled,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        phone: user.phone,
        address: user.address,
        isMfaEnabled: user.isMfaEnabled,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
