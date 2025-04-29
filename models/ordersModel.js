import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true ,set: value => Number(value.toFixed(2))},
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true,set: value => Number(value.toFixed(2))},
  });
  
  const timelineSchema = new mongoose.Schema({
    status: String,
    date: String
  });
const orderSchema = new mongoose.Schema({
    
    orderId:{
        type: String,
        default: () => "KN" + Math.floor(Math.random() * 1000000),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    date: { type: String, required: true },
    total: { type: Number, required: true ,set: value => Number(value.toFixed(2))},
    addressId: { type: String }, 
    paymentMethod: { type: String,
        enum: ['COD', 'Khalti'],
        default: 'COD', 
     }, 
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'out for delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveryDate: { type: String },
    trackingNumber: {
         type: String ,
         default: () => "KN-T" + Math.floor(Math.random() * 1000001),},
    items: [itemSchema],
    timeline: [timelineSchema]
  }, { timestamps: true });
  const order = mongoose.models.order || mongoose.model("order", orderSchema);
 export default order;
  