import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/jwt';

export async function GET(request) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    // 1. Fetch Real Database Aggregations
    const allOrders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});

    // Total Revenue from all created orders
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalOrders = allOrders.length;

    // 2. Fetch Low Stock Items (stock <= 10)
    const lowStockProducts = await Product.find({ stock: { $lte: 10 } }).select('name stock category price images');

    // 3. Recent 5 Orders
    const recentOrders = allOrders.slice(0, 5);

    // 4. Dynamic Monthly Sales Trajectory (Last 6 Months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyMap = {};

    // Initialize last 6 calendar months with 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = months[d.getMonth()];
      monthlyMap[mLabel] = { month: mLabel, revenue: 0, orders: 0 };
    }

    // Populate actual order revenues into monthly bins
    allOrders.forEach((o) => {
      if (o.createdAt) {
        const orderDate = new Date(o.createdAt);
        const mLabel = months[orderDate.getMonth()];
        if (monthlyMap[mLabel]) {
          monthlyMap[mLabel].revenue += Math.round(o.totalPrice || 0);
          monthlyMap[mLabel].orders += 1;
        }
      }
    });

    const monthlySales = Object.values(monthlyMap);

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalUsers,
        totalProducts,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts,
      recentOrders,
      monthlySales,
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

