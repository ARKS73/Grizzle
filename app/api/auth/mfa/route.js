import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser } from '@/lib/jwt';
import { generateTotpSecret, verifyTOTP } from '@/lib/totp';

export const dynamic = 'force-dynamic';

// GET — Setup MFA: Generate secret & otpauth URL for QR Code
export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const { secret, otpauthUrl } = generateTotpSecret(user.email);

    // Save temporary secret until enabled
    user.mfaSecret = secret;
    await user.save();

    return NextResponse.json({
      success: true,
      secret,
      otpauthUrl,
      isMfaEnabled: user.isMfaEnabled,
    });
  } catch (error) {
    console.error('MFA Setup GET Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST — Enable MFA after verifying code
export async function POST(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { otpCode } = await request.json();
    if (!otpCode) {
      return NextResponse.json({ success: false, message: 'Please enter 6-digit OTP code' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user || !user.mfaSecret) {
      return NextResponse.json({ success: false, message: 'MFA Setup incomplete' }, { status: 400 });
    }

    const isValid = verifyTOTP(user.mfaSecret, otpCode);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP code. Make sure your device time is synchronized.' },
        { status: 400 }
      );
    }

    user.isMfaEnabled = true;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Multi-Factor Authentication (MFA) successfully enabled!',
      isMfaEnabled: true,
    });
  } catch (error) {
    console.error('MFA Enable Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE — Disable MFA
export async function DELETE(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    user.isMfaEnabled = false;
    user.mfaSecret = '';
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'MFA has been disabled.',
      isMfaEnabled: false,
    });
  } catch (error) {
    console.error('MFA Disable Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
