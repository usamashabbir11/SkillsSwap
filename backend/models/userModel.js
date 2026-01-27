import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    bio: { type: String, default: "" },
    phone: { type: String, default: "" },
    city: { type: String, default: "" },

    profileImage: { type: String, default: "" },
    coverImage: { type: String, default: "" },

    // PHASE 4 – SKILLS
    skillsOffered: {
      type: [String],
      default: []
    },
    skillsRequired: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
