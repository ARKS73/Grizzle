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
  },
  { timestamps: true }
);

export default mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);
