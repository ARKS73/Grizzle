import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: { type: String, required: true },
    userImage: { type: String, default: '' },
    rating: {
      type: Number,
      required: [true, 'Rating (1-5) is required'],
      min: 1,
      max: 5,
    },
    title: { type: String, default: '' },
    comment: {
      type: String,
      default: '',
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ createdAt: -1 });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
