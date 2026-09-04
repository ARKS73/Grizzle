import mongoose from 'mongoose';

const StoreSettingsSchema = new mongoose.Schema(
  {
    heroImage: {
      type: String,
      default: '',
    },
    heroBadge: {
      type: String,
      default: 'NEW DROP | SEASON 2026',
    },
    heroTitle: {
      type: String,
      default: 'HIGH-DENSITY DTF PRINTS',
    },
    heroAccentTitle: {
      type: String,
      default: 'YOU CAN WEAR',
    },
    heroDesc: {
      type: String,
      default: 'Bio-Washed Premium Cotton Streetwear Built for Style & Longevity.',
    },
    heroTapeNote: {
      type: String,
      default: 'LIMITED TO 100 PIECES GLOBALLY',
    },
    showHeroProductsRow: {
      type: Boolean,
      default: false,
    },
    heroFeaturedProductIds: {
      type: [String],
      default: [],
    },
    defaultShippingFee: {
      type: Number,
      default: 49,
    },
    freeShippingMode: {
      type: Boolean,
      default: false,
    },
    trustHappyCustomers: {
      type: String,
      default: '15,000+',
    },
    trustInstagramFollowers: {
      type: String,
      default: '45.8K+',
    },
    trustInstagramUrl: {
      type: String,
      default: 'https://www.instagram.com/grizzle.in?igsh=MWhqNnczNThqamdtYg==',
    },
    trustReviewsText: {
      type: String,
      default: '4.9 ★',
    },
    trustSecureCheckoutText: {
      type: String,
      default: '100%',
    },
    featureCards: {
      type: [
        {
          iconName: { type: String, default: 'Truck' },
          value: { type: String, default: '24-48 HR' },
          label: { type: String, default: 'EXPRESS DISPATCH' },
          sub: { type: String, default: 'Pan-India shipping with live tracking' },
          link: { type: String, default: '/orders' },
        },
      ],
      default: [
        {
          iconName: 'Truck',
          value: 'EXPRESS DISPATCH',
          label: 'NATIONWIDE DELIVERY',
          sub: 'Pan-India shipping with live order tracking',
          link: '/orders',
        },
        {
          iconName: 'RotateCcw',
          value: 'EASY EXCHANGES',
          label: 'DOORSTEP PICKUP',
          sub: 'Hassle-free size exchanges & dedicated support',
          link: '#return-policy',
        },
        {
          iconName: 'Award',
          value: 'PREMIUM FABRIC',
          label: 'BIO-WASHED COTTON',
          sub: 'Heavy combed cotton built for longevity',
          link: '',
        },
        {
          iconName: 'Instagram',
          value: 'INSTAGRAM COMMUNITY',
          label: '@GRIZZLE.IN',
          sub: 'Follow official page for upcoming drop alerts',
          link: 'https://www.instagram.com/grizzle.in?igsh=MWhqNnczNThqamdtYg==',
        },
        {
          iconName: 'Sparkles',
          value: 'HIGH DENSITY PRINTS',
          label: 'DTF PRINT COLLECTIVE',
          sub: 'Vibrant detailed graphics engineered for long-lasting premium wear',
          link: '',
        },
        {
          iconName: 'ShieldCheck',
          value: '100% SECURE',
          label: 'COD & ONLINE PAYMENTS',
          sub: 'Encrypted checkout with Cash on Delivery available',
          link: '',
        },
      ],
    },
    footerAboutText: {
      type: String,
      default: 'Self-Made High-Density DTF Printed Streetwear. Bio-Washed Premium Cotton Built for Style & Longevity.',
    },
    footerCopyrightText: {
      type: String,
      default: '© 2026 Grizzle Apparel India. All rights reserved. Self-Made Printed T-Shirts.',
    },
    footerCustomLinks: {
      type: [
        {
          label: { type: String, required: true },
          url: { type: String, required: true },
        },
      ],
      default: [
        { label: '📐 Size Chart & Fit Guide', url: '#size-chart' },
        { label: '🚚 Shipping & Delivery Policy', url: '#shipping-policy' },
        { label: '🔄 Returns & Refund Policy', url: '#return-policy' },
        { label: '💬 Contact Us on WhatsApp', url: 'https://wa.me/919176281858?text=Hi%20Grizzle%20Support%2C%20I%20have%20an%20inquiry' },
        { label: '📦 Track Your Order', url: '/orders' },
      ],
    },
    sizeChartData: {
      type: [
        {
          size: String,
          chestIn: String,
          chestCm: String,
          lengthIn: String,
          lengthCm: String,
          shoulderIn: String,
          shoulderCm: String,
          sleeveIn: String,
          sleeveCm: String,
        },
      ],
      default: [
        { size: 'S', chestIn: '38-40"', chestCm: '96-102 cm', lengthIn: '27.5"', lengthCm: '70 cm', shoulderIn: '18.5"', shoulderCm: '47 cm', sleeveIn: '8.5"', sleeveCm: '21 cm' },
        { size: 'M', chestIn: '40-42"', chestCm: '102-107 cm', lengthIn: '28.5"', lengthCm: '72 cm', shoulderIn: '19.5"', shoulderCm: '49.5 cm', sleeveIn: '9.0"', sleeveCm: '23 cm' },
        { size: 'L', chestIn: '42-44"', chestCm: '107-112 cm', lengthIn: '29.5"', lengthCm: '75 cm', shoulderIn: '20.5"', shoulderCm: '52 cm', sleeveIn: '9.5"', sleeveCm: '24 cm' },
        { size: 'XL', chestIn: '44-46"', chestCm: '112-117 cm', lengthIn: '30.5"', lengthCm: '77 cm', shoulderIn: '21.5"', shoulderCm: '54.5 cm', sleeveIn: '10.0"', sleeveCm: '25.5 cm' },
        { size: 'XXL', chestIn: '46-48"', chestCm: '117-122 cm', lengthIn: '31.5"', lengthCm: '80 cm', shoulderIn: '22.5"', shoulderCm: '57 cm', sleeveIn: '10.5"', sleeveCm: '26.5 cm' },
      ],
    },
    sizeChartTips: {
      type: String,
      default: 'Oversized Streetwear Fit: Choose your standard size for a relaxed dropped-shoulder silhouette. For regular fit, size down 1 size.',
    },
    sizeChartColumns: {
      type: [String],
      default: ['Size', 'Chest (in)', 'Chest (cm)', 'Length (in)', 'Length (cm)', 'Shoulder (in)', 'Shoulder (cm)'],
    },
    sizeChartRows: {
      type: [[String]],
      default: [
        ['S', '38-40"', '96-102 cm', '27.5"', '70 cm', '18.5"', '47 cm'],
        ['M', '40-42"', '102-107 cm', '28.5"', '72 cm', '19.5"', '49.5 cm'],
        ['L', '42-44"', '107-112 cm', '29.5"', '75 cm', '20.5"', '52 cm'],
        ['XL', '44-46"', '112-117 cm', '30.5"', '77 cm', '21.5"', '54.5 cm'],
        ['XXL', '46-48"', '117-122 cm', '31.5"', '80 cm', '22.5"', '57 cm'],
      ],
    },
    returnPolicyText: {
      type: String,
      default: 'We accept returns and exchanges for unworn, unwashed items in original bio-bag packaging with tags intact. To initiate a return, contact us on WhatsApp with your Order Invoice Number.',
    },
    shippingPolicyText: {
      type: String,
      default: 'All orders are processed within 24-48 hours. Standard dispatch takes 3-5 business days across India. Cash On Delivery (COD) and Online Express Delivery available.',
    },
  },
  { timestamps: true }
);

export default mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);
