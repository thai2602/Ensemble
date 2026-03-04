import mongoose from "mongoose";

function cleanStr(v) {
  if (v == null) return "";
  return String(v).trim();
}

function isGoodUrlOrUploadPath(v) {
  if (!v) return true;
  return v.startsWith("/uploads/") || /^https?:\/\//i.test(v);
}

const shopSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },

    avatar: {
      type: String,
      set: cleanStr,
      validate: {
        validator: isGoodUrlOrUploadPath,
        message: "Avatar must be http(s) URL or start with /uploads/...",
      },
      default: "",
    },

    images: [{
      type: String,
      set: cleanStr,
      validate: {
        validator: isGoodUrlOrUploadPath,
        message: "Image URL must be http(s) or /uploads/...",
      },
    }],

    description: { type: String, set: cleanStr, default: "" },

    contact: {
      phone: { type: String, set: cleanStr, default: "" },
      email: { type: String, set: cleanStr, default: "" },
      facebook: { type: String, set: cleanStr, default: "" },
      address: { type: String, set: cleanStr, default: "" },
    },

    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }],

    albums: [{
      name: { type: String, required: true, trim: true },
      products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      }],
    }],

    // AI Design
    currentDesignConfig: { type: Object, default: {} },
    designVersions: [{
      name: { type: String, required: true, trim: true },
      createdAt: { type: Date, default: Date.now },
      config: { type: Object, required: true }
    }],
  },
  { timestamps: true }
);

shopSchema.pre("save", function (next) {
  const fix = (v) => (isGoodUrlOrUploadPath(v) ? v : "");
  this.avatar = fix(this.avatar);
  if (Array.isArray(this.images)) {
    this.images = this.images.map(fix);
  }
  if (this.contact && this.contact.facebook && !isGoodUrlOrUploadPath(this.contact.facebook)) {
    this.contact.facebook = "";
  }
  next();
});

const Shop = mongoose.model("Shop", shopSchema);
export default Shop;
