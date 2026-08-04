import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists. Please Sign In.' },
        { status: 400 }
      );
    }

    // Generate 6-digit numeric OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email service is not configured. Set SMTP_USER and SMTP_PASS before sending registration OTPs.',
        },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border-radius: 12px; background: #0f172a; color: #ffffff; border: 1px solid #334155;">
        <div style="text-align: center; padding-bottom: 16px; border-bottom: 1px solid #334155;">
          <h2 style="color: #ef4444; margin: 0; font-size: 24px; font-weight: 800;">GRIZZLE APPAREL</h2>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Email Verification Code</p>
        </div>

        <div style="padding: 24px 0; text-align: center;">
          <p style="font-size: 15px; color: #e2e8f0; margin-bottom: 16px;">
            Thank you for joining Grizzle! Use the 6-digit verification code below to complete your account registration:
          </p>

          <div style="display: inline-block; background: #1e293b; padding: 14px 32px; border-radius: 10px; border: 2px solid #ef4444; margin: 12px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #ffffff;">${generatedOtp}</span>
          </div>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">
            This OTP code is valid for 10 minutes. If you did not request this email, please ignore it.
          </p>
        </div>

        <div style="text-align: center; padding-top: 16px; border-top: 1px solid #334155; font-size: 12px; color: #64748b;">
          &copy; ${new Date().getFullYear()} Grizzle Apparel Inc. All rights reserved.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Grizzle Support" <${smtpUser}>`,
      to: email.toLowerCase(),
      subject: `🔐 ${generatedOtp} is your Grizzle Registration Verification OTP Code`,
      html: htmlContent,
    });

    console.log(`[OTP SENT] Real email successfully sent to ${email} with OTP ${generatedOtp}`);

    return NextResponse.json({
      success: true,
      message: `Verification OTP sent to ${email}`,
      otp: generatedOtp,
      emailSent: true,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
