import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Auto-seeding and automatic database resets are permanently disabled to preserve 100% pure live seller MongoDB data.',
  });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Auto-seeding and automatic database resets are permanently disabled to preserve 100% pure live seller MongoDB data.',
  });
}
