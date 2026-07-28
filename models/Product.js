import mongoose from 'mongoose';

const ColorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true },
});

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
    },
    gender: {
      type: String,
      enum: ['Men', 'Women', 'Unisex'],
      default: 'Unisex',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    sizes: {
      type: [String],
      enum: ['S', 'M', 'L', 'XL', 'XXL'],
      default: ['S', 'M', 'L', 'XL'],
    },
    colors: [ColorSchema],
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      default: 20,
    },
    ratings: {
      type: Number,
      default: 4.8,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      required: true,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
