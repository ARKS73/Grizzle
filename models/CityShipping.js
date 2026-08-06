import mongoose from 'mongoose';

const CityShippingSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    state: {
      type: String,
      default: 'Tamil Nadu',
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.CityShipping || mongoose.model('CityShipping', CityShippingSchema);
