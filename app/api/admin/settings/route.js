import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StoreSettings from '@/models/StoreSettings';
import { getAuthUser } from '@/lib/jwt';
import { getCachedData, setCachedData, clearStoreCache } from '@/lib/storeCache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cachedSettings = getCachedData('store_settings');
    if (cachedSettings) {
      return NextResponse.json({ success: true, settings: cachedSettings });
    }

    await connectDB();
    let settings = await StoreSettings.findOne().lean();
    if (!settings) {
      settings = await StoreSettings.create({});
    }

    setCachedData('store_settings', settings, 60000);

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Fetch StoreSettings Error:', error);
    return NextResponse.json({
      success: true,
      settings: {
        heroImage: '',
        heroBadge: 'NEW DROP | SEASON 2026',
        heroTitle: 'HIGH-DENSITY DTF PRINTS',
        heroAccentTitle: 'YOU CAN WEAR',
        heroDesc: 'Merging high-fidelity DTF printing with 240 GSM bio-washed heavy cotton. Vibrant prints built to last for 50+ washes.',
        heroTapeNote: 'LIMITED TO 100 PIECES GLOBALLY',
      },
    });
  }
}

export async function PUT(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings(body);
    } else {
      Object.assign(settings, body);
    }

    await settings.save();
    clearStoreCache();

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Update StoreSettings Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
