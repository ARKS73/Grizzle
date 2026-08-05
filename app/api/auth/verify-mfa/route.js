import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken, signToken, COOKIE_NAME } from '@/lib/jwt';
import { verifyTOTP } from '@/lib/totp';

export async function POST(request) {
  try {
    const { tempToken, otpCode } = await request.json();

    if (!tempToken || !otpCode) {
      return NextResponse.json(
        { success: false, message: 'Please enter the 6-digit OTP from your Authenticator app.' },
        { status: 400 }
      );
    }

    const decoded = verifyToken(tempToken);
    if (!decoded || !decoded.userId || decoded.role !== 'admin_mfa_pending') {
      return NextResponse.json(
        { success: false, message: 'Session expired or invalid security token. Please log in again.' },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(decoded.userId);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized admin user' },
        { status: 403 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { success: false, message: 'Account is suspended.' },
        { status: 403 }
      );
    }

    const isValid = verifyTOTP(user.mfaSecret, otpCode);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid 6-digit OTP code. Please check your Authenticator app and try again.' },
        { status: 400 }
      );
    }

    // Authenticator OTP verified! Issue full 30-day Admin session JWT
    const fullTokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const authToken = signToken(fullTokenPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Multi-Factor Authentication verified! Access granted.',
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
      value: authToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify MFA Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
