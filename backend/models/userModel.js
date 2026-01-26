import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },

    // phase 1 profile fields
    bio: {
      type: String,
      default: ""
    },
    phone: {
      type: String,
      default: ""
    },
    city: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
