import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0, 
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  inStock: {
    type: Boolean,
    default: true, 
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  },
});

const productModel = mongoose.models.product || mongoose.model('product', productSchema);

export default productModel;
