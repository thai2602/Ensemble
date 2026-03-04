// models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true }, 
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  details: { type: String },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },
  images: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', required: true },
  slug: { type: String, required: true, unique: true },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

productSchema.index({ shopId: 1, name: 1 });
productSchema.index({ shopId: 1, slug: 1 }, { unique: true });

export default mongoose.model('Product', productSchema);
