import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Coupon from '@/models/Coupon';
import Review from '@/models/Review';
import Order from '@/models/Order';
import { seedCategories, seedProducts, seedCoupons } from '@/lib/seedData';

export async function GET() {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({
        success: false,
        message: 'Database connection offline, using dynamic seed fallback in-memory state.',
      }, { status: 200 });
    }

    // 1. Seed Categories
    await Category.deleteMany({});
    const createdCategories = await Category.insertMany(seedCategories);

    // 2. Seed Users
    await User.deleteMany({});
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedCustomerPassword = await bcrypt.hash('user123', 10);

    const adminUser = await User.create({
      name: 'Alex Vance (Admin)',
      email: 'admin@grizzle.com',
      password: hashedAdminPassword,
      role: 'admin',
      phone: '+1 (555) 019-2834',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      address: {
        street: '742 Evergreen Terrace',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
      },
    });

    const customerUser = await User.create({
      name: 'Sophia Martinez',
      email: 'customer@grizzle.com',
      password: hashedCustomerPassword,
      role: 'customer',
      phone: '+1 (555) 349-8120',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      address: {
        street: '120 Broadway Suite 400',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94104',
        country: 'United States',
      },
    });

    // 3. Seed Products
    await Product.deleteMany({});
    const createdProducts = await Product.insertMany(seedProducts);

    // Update Category product counts
    for (const cat of createdCategories) {
      const count = createdProducts.filter((p) => p.category === cat.name).length;
      await Category.findByIdAndUpdate(cat._id, { productCount: count });
    }

    // 4. Seed Coupons
    await Coupon.deleteMany({});
    await Coupon.insertMany(seedCoupons);

    // 5. Seed Sample Reviews
    await Review.deleteMany({});
    if (createdProducts.length > 0) {
      await Review.create({
        product: createdProducts[0]._id,
        user: customerUser._id,
        userName: customerUser.name,
        userImage: customerUser.profileImage,
        rating: 5,
        title: 'Outstanding Quality & Fit!',
        comment: 'The cotton weight feels super premium. Dropped shoulder silhouette is spot on. Definitely ordering more colors.',
        isVerifiedPurchase: true,
      });
    }

    // 6. Seed Sample Order
    await Order.deleteMany({});
    if (createdProducts.length > 0) {
      await Order.create({
        user: customerUser._id,
        orderItems: [
          {
            product: createdProducts[0]._id,
            name: createdProducts[0].name,
            image: createdProducts[0].images[0],
            price: createdProducts[0].price,
            quantity: 2,
            size: 'L',
            color: 'Pitch Black',
          },
        ],
        shippingAddress: {
          fullName: customerUser.name,
          phone: customerUser.phone,
          street: customerUser.address.street,
          city: customerUser.address.city,
          state: customerUser.address.state,
          postalCode: customerUser.address.postalCode,
          country: customerUser.address.country,
        },
        paymentMethod: 'Credit Card (Mock)',
        itemsPrice: 69.98,
        shippingPrice: 0,
        discountAmount: 10,
        totalPrice: 59.98,
        isPaid: true,
        paidAt: new Date(),
        status: 'Delivered',
        invoiceNumber: 'INV-849201',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with demo clothes products, admin user, customer, categories, and reviews!',
      credentials: {
        admin: { email: 'admin@grizzle.com', password: 'admin123' },
        customer: { email: 'customer@grizzle.com', password: 'user123' },
      },
      stats: {
        products: createdProducts.length,
        categories: createdCategories.length,
        users: 2,
      },
    });
  } catch (error) {
    console.error('Seeding Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
