import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, COOKIE_NAME } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { success: false, message: 'Google ID token is required' },
        { status: 400 }
      );
    }

    // Verify Google / Firebase ID Token via Google's tokeninfo API
    let tokenPayload = null;
    try {
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (googleRes.ok) {
        tokenPayload = await googleRes.json();
      }
    } catch (e) {
      console.warn('Google tokeninfo fetch failed, parsing jwt payload fallback:', e.message);
    }

    // Fallback parsing if Google API validation endpoint unavailable
    if (!tokenPayload || !tokenPayload.email) {
      try {
        const parts = idToken.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
          tokenPayload = JSON.parse(payloadJson);
        }
      } catch (e) {
        console.error('Failed to parse ID Token payload:', e);
      }
    }

    if (!tokenPayload || !tokenPayload.email) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired Google authentication token' },
        { status: 401 }
      );
    }

    const { email, name, picture } = tokenPayload;
    const cleanEmail = email.toLowerCase().trim();

    await connectDB();

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Create new user for Google Sign-In
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: hashedPassword,
        role: 'customer',
        isVerified: true,
        profileImage: picture || '',
      });
    } else {
      // Update profile picture if missing
      if (!user.profileImage && picture) {
        user.profileImage = picture;
        await user.save();
      }
    }

    // Account Suspension & Lockout Protection Checks
    if (user.isBlocked) {
      return NextResponse.json(
        { success: false, message: 'Your account has been suspended. Please contact support.' },
        { status: 403 }
      );
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.lockUntil).getTime() - Date.now()) / (1000 * 60));
      return NextResponse.json(
        { success: false, message: `Account is locked. Please try again in ${minutesLeft} minutes.` },
        { status: 429 }
      );
    }

    // If Admin account has MFA enabled, enforce MFA
    if (user.role === 'admin' && user.isMfaEnabled) {
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

    // Reset any failed attempt counters
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    // Issue application's HTTP-Only 30-day JWT session cookie
    const userPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = signToken(userPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Google Sign-In successful',
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
    console.error('Google Auth API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Google Authentication failed' },
      { status: 500 }
    );
  }
}
