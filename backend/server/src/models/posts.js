import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  summary: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  image: { type: String, default: '' },
  slug: { type: String, required: true, unique: true },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }],
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null, index: true },

  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);
export default Post;
