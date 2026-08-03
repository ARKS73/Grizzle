import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Please provide email, 6-digit OTP, and new password' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User with this email not found' },
        { status: 404 }
      );
    }

    // Verify OTP code
    if (!user.resetOtp || user.resetOtp !== otp.trim()) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP verification code' },
        { status: 400 }
      );
    }

    // Verify OTP expiry
    if (!user.resetOtpExpiry || new Date(user.resetOtpExpiry) < new Date()) {
      return NextResponse.json(
        { success: false, message: 'OTP code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash new password and clear OTP
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
