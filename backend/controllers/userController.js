import userService from "../services/userService.js";
import registerValidation from "../validations/userValidation.js";
import { hashPassword } from "../utils/hash.js";
import { generateToken } from "../utils/token.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import SwapRequest from "../models/swapRequestModel.js";
import SwapDeal from "../models/swapDealModel.js";
import Notification from "../models/notificationModel.js";

/* ===================== REGISTER ===================== */
const registerUser = async (req, res) => {
  const { error } = registerValidation.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { name, email, password } = req.body;
  const existingUser = await userService.findUserByEmail(email);
  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "Email already registered" });
  }

  const hashedPassword = await hashPassword(password);
  await userService.createUser({ name, email, password: hashedPassword });

  res
    .status(201)
    .json({ success: true, message: "User registered successfully" });
};

/* ===================== LOGIN ===================== */
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
};

/* ===================== GET PROFILE ===================== */
const getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

/* ===================== UPDATE PROFILE INFO ===================== */
const updateProfile = async (req, res) => {
  const { name, email, bio, phone, city } = req.body;
  const user = await User.findById(req.user._id);

  user.name = name ?? user.name;
  user.email = email ?? user.email;
  user.bio = bio ?? user.bio;
  user.phone = phone ?? user.phone;
  user.city = city ?? user.city;

  await user.save();
  res.json({ success: true, data: user });
};

/* ===================== UPLOAD PROFILE IMAGE ===================== */
const uploadProfileImage = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No image uploaded" });
  }

  const user = await User.findById(req.user._id);
  user.profileImage = `/uploads/${req.file.filename}`;
  await user.save();

  res.json({ success: true, data: user });
};

/* ===================== UPLOAD COVER IMAGE ===================== */
const uploadCoverImage = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No image uploaded" });
  }

  const user = await User.findById(req.user._id);
  user.coverImage = `/uploads/${req.file.filename}`;
  await user.save();

  res.json({ success: true, data: user });
};

/* ===================== UPDATE SKILLS ===================== */
const updateSkills = async (req, res) => {
  const { skillsOffered, skillsRequired } = req.body;
  const user = await User.findById(req.user._id);

  user.skillsOffered = Array.isArray(skillsOffered) ? skillsOffered : [];
  user.skillsRequired = Array.isArray(skillsRequired) ? skillsRequired : [];

  await user.save();
  res.json({ success: true, data: user });
};

/* ===================== ADD COURSE ===================== */
const addCourse = async (req, res) => {
  const { title, price } = req.body;

  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Video required" });
  }

  const user = await User.findById(req.user._id);

  user.courses.push({
    title,
    price,
    video: `/uploads/${req.file.filename}`
  });

  await user.save();
  res.json({ success: true, data: user.courses });
};

/* ===================== GET ALL USERS ===================== */
const getAllUsers = async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } });
  res.json({ success: true, data: users });
};

/* ===================== GET USER BY ID ===================== */
const getUserById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user id" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: "User not found" });
  }

  res.json({ success: true, data: user });
};

/* ===================== DELETE OWN PROFILE ===================== */
const deleteOwnProfile = async (req, res) => {
  const userId = req.user._id;

  await SwapRequest.deleteMany({ $or: [{ from: userId }, { to: userId }] });
  await SwapDeal.deleteMany({ $or: [{ userA: userId }, { userB: userId }] });
  await Notification.deleteMany({ user: userId });
  await User.findByIdAndDelete(userId);

  res.json({ success: true, message: "Account deleted successfully" });
};

/* ===================== ADMIN DELETE USER ===================== */
const adminDeleteUser = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid user id" });
  }

  const target = await User.findById(req.params.id);
  if (!target) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const userId = target._id;

  await SwapRequest.deleteMany({ $or: [{ from: userId }, { to: userId }] });
  await SwapDeal.deleteMany({ $or: [{ userA: userId }, { userB: userId }] });
  await Notification.deleteMany({ user: userId });
  await User.findByIdAndDelete(userId);

  res.json({ success: true, message: "User deleted successfully" });
};

/* ===================== EXPORT ===================== */
export default {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  uploadProfileImage,
  uploadCoverImage,
  updateSkills,
  addCourse,
  getAllUsers,
  getUserById,
  deleteOwnProfile,
  adminDeleteUser
};
