import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    video: { type: String, required: true }
  },
  { _id: false }
);

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

    skillsOffered: { type: [String], default: [] },
    skillsRequired: { type: [String], default: [] },

    /* PHASE 5 – COURSES */
    courses: {
      type: [courseSchema],
      default: []
    },

    /* PHASE 9 – ROLE */
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    /* PHASE 14B – LOCATION */
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }
    }
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
export default User;
