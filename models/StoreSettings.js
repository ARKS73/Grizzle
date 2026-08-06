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
      default: 'Merging high-fidelity DTF printing with 240 GSM bio-washed heavy cotton. Vibrant prints built to last for 50+ washes.',
    },
    heroTapeNote: {
      type: String,
      default: 'LIMITED TO 100 PIECES GLOBALLY',
    },
    defaultShippingFee: {
      type: Number,
      default: 49,
    },
    footerAboutText: {
      type: String,
      default: 'Self-Made High-Density DTF Printed Streetwear. Bio-Washed 240 GSM Premium Cotton Built for Style & Longevity.',
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
        { label: '🚚 Shipping & Delivery Policy', url: '/products' },
        { label: '🔄 Returns & Refund Policy', url: '/orders' },
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
  },
  { timestamps: true }
);

export default mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);
