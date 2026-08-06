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
  },
  { timestamps: true }
);

export default mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);
