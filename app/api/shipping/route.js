import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CityShipping from '@/models/CityShipping';
import StoreSettings from '@/models/StoreSettings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const rates = await CityShipping.find({}).sort({ city: 1 });
    let settings = await StoreSettings.findOne();
    const freeShippingMode = Boolean(settings?.freeShippingMode);
    const defaultShippingFee = settings?.defaultShippingFee !== undefined ? settings.defaultShippingFee : 49;

    return NextResponse.json({
      success: true,
      rates,
      defaultShippingFee: freeShippingMode ? 0 : defaultShippingFee,
      standardDefaultShippingFee: defaultShippingFee,
      freeShippingMode,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
