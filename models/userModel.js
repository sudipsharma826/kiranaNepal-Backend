import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        
        return !this.isGoogleUser;
      },
      default: null, 
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      default: null,
    },
    cartItems: {
      type: Object,
      default: {},
    },
    image: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
  },
  {
    minimize: false,
    timestamps: true,
  }
);

const User = mongoose.models.user || mongoose.model("user", userSchema);
export default User;
