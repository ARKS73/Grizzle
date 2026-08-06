import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CityShipping from '@/models/CityShipping';
import StoreSettings from '@/models/StoreSettings';
import { getAuthUser } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

function checkAdmin(request) {
  const user = getAuthUser(request);
  if (!user) return false;
  return user.role === 'admin' || user.email?.toLowerCase() === 'grizzlein@gmail.com';
}

export async function GET(request) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized admin access' }, { status: 403 });
    }
    await connectDB();
    const rates = await CityShipping.find({}).sort({ city: 1 });
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({});
    }
    const defaultShippingFee = settings.defaultShippingFee !== undefined ? settings.defaultShippingFee : 49;

    return NextResponse.json({
      success: true,
      rates,
      defaultShippingFee,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Add new city shipping rate OR update default shipping fee
export async function POST(request) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized admin access' }, { status: 403 });
    }
    const body = await request.json();
    await connectDB();

    // If updating default global fee
    if (body.action === 'update_default') {
      const { defaultShippingFee } = body;
      let settings = await StoreSettings.findOne();
      if (!settings) {
        settings = await StoreSettings.create({ defaultShippingFee: Number(defaultShippingFee) || 0 });
      } else {
        settings.defaultShippingFee = Number(defaultShippingFee) || 0;
        await settings.save();
      }
      return NextResponse.json({
        success: true,
        message: 'Default shipping fee updated successfully',
        defaultShippingFee: settings.defaultShippingFee,
      });
    }

    // Otherwise add or update specific city rate
    const { city, state, shippingFee } = body;
    if (!city || shippingFee === undefined || shippingFee === null) {
      return NextResponse.json({ success: false, message: 'City and shipping fee are required' }, { status: 400 });
    }

    const trimmedCity = city.trim();
    const feeNum = Number(shippingFee);

    let existing = await CityShipping.findOne({ city: { $regex: new RegExp(`^${trimmedCity}$`, 'i') } });
    if (existing) {
      existing.shippingFee = feeNum;
      if (state) existing.state = state;
      await existing.save();
      return NextResponse.json({
        success: true,
        message: `Updated shipping fee for ${existing.city} to ₹${feeNum}`,
        rate: existing,
      });
    }

    const newRate = await CityShipping.create({
      city: trimmedCity,
      state: state || 'Tamil Nadu',
      shippingFee: feeNum,
    });

    return NextResponse.json({
      success: true,
      message: `Added shipping fee for ${newRate.city} (₹${feeNum})`,
      rate: newRate,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Delete a city rate
export async function DELETE(request) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized admin access' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'City shipping ID required' }, { status: 400 });
    }

    await connectDB();
    await CityShipping.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'City shipping rate deleted successfully',
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
