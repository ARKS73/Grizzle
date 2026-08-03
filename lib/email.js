import nodemailer from 'nodemailer';

export async function sendOTPEmail(toEmail, otp) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // If SMTP settings are provided, send actual email
  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #0f172a; color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #334155;">
            <h2 style="color: #6366f1; margin: 0;">Grizzle T-Shirts</h2>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Password Reset Verification Code</p>
          </div>
          <div style="padding: 24px 0; text-align: center;">
            <p style="font-size: 16px; color: #cbd5e1;">Use the following 6-digit OTP code to reset your account password. This code will expire in 10 minutes.</p>
            <div style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 6px; border-radius: 8px; margin: 16px 0;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 16px;">If you did not request a password reset, please ignore this email.</p>
          </div>
          <div style="text-align: center; padding-top: 16px; border-top: 1px solid #334155; font-size: 12px; color: #64748b;">
            &copy; ${new Date().getFullYear()} Grizzle Apparel India. All rights reserved.
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Grizzle Support" <${user}>`,
        to: toEmail,
        subject: `${otp} is your Grizzle Password Reset OTP`,
        html: htmlContent,
      });

      console.log(`[Email Service] Sent OTP email to ${toEmail}`);
      return { success: true, method: 'smtp' };
    } catch (error) {
      console.error('[Email Service Error]:', error);
      // Fallback log
      console.log(`\n=========================================\n[DEMO OTP CODE for ${toEmail}]: ${otp}\n=========================================\n`);
      return { success: true, method: 'demo', otp };
    }
  }

  // Fallback for local testing / demo mode without SMTP credentials set
  console.log(`\n=========================================\n[DEMO OTP CODE for ${toEmail}]: ${otp}\n=========================================\n`);
  return { success: true, method: 'demo', otp };
}
