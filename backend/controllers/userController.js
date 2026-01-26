import userService from "../services/userService.js";
import registerValidation from "../validations/userValidation.js";
import { hashPassword } from "../utils/hash.js";
import { generateToken } from "../utils/token.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/userModel.js";

const registerUser = async (req, res) => {
  const { error } = registerValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const { name, email, password } = req.body;

  const existingUser = await userService.findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }

  const hashedPassword = await hashPassword(password);

  await userService.createUser({
    name,
    email,
    password: hashedPassword
  });

  res.status(201).json({ success: true, message: "User registered successfully" });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    }
  });
};

const getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

const updateProfile = async (req, res) => {
  const { name, email, bio, phone, city } = req.body;

  const user = await User.findById(req.user._id);

  user.name = name ?? user.name;
  user.email = email ?? user.email;
  user.bio = bio ?? user.bio;
  user.phone = phone ?? user.phone;
  user.city = city ?? user.city;

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: updatedUser
  });
};

const getAllUsers = async (req, res) => {
  // 🔴 EXCLUDE LOGGED-IN USER
  const users = await User.find({
    _id: { $ne: req.user._id }
  }).select("name email bio phone city");

  res.json({ success: true, data: users });
};

const getUserById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid user id" });
  }

  const user = await User.findById(req.params.id).select("name email bio phone city");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.json({ success: true, data: user });
};

export default {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById
};
