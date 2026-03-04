import mongoose from 'mongoose';

const albumItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  note: { type: String, trim: true },
  position: { type: Number, default: 0 },
}, { _id: false });

const albumSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  theme: { type: String, trim: true, default: '' },
  coverImage: { type: String, default: '' },
  description: { type: String, trim: true, default: '' },
  visibility: { type: String, enum: ['public','unlisted','private'], default: 'public' },
  items: [albumItemSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

albumSchema.index({ shopId: 1, slug: 1 }, { unique: true });
albumSchema.index({ shopId: 1, updatedAt: -1 });

export default mongoose.model('Album', albumSchema);
