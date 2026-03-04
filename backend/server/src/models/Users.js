import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String, required: true, trim: true, unique: true, minlength: 3, maxlength: 30
    },
    email: {
      type: String, required: true, trim: true, unique: true, lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email']
    },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true } 
);

const User = mongoose.model('User', userSchema);
export default User;
