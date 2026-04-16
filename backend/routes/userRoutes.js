import express from "express";
import userController from "../controllers/userController.js";
import getLoggedInUser, { requireAdmin } from "../middlewares/userMiddleware.js";
import { uploadProfile, uploadCover, uploadCourse } from "../config/cloudinary.js";

const router = express.Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

router.get("/profile", getLoggedInUser, userController.getProfile);
router.put("/profile", getLoggedInUser, userController.updateProfile);

/* ✅ IMAGE UPLOAD ROUTES (THIS WAS MISSING) */
router.put(
  "/profile/image",
  getLoggedInUser,
  (req, res, next) => {
    uploadProfile.single("image")(req, res, (err) => {
      if (err) {
        console.error("[MULTER ERROR] profile image:", err);
        return res.status(500).json({ success: false, message: err.message });
      }
      next();
    });
  },
  userController.uploadProfileImage
);

router.put(
  "/profile/cover",
  getLoggedInUser,
  (req, res, next) => {
    uploadCover.single("image")(req, res, (err) => {
      if (err) {
        console.error("[MULTER ERROR] cover image:", err);
        return res.status(500).json({ success: false, message: err.message });
      }
      next();
    });
  },
  userController.uploadCoverImage
);

router.put("/skills", getLoggedInUser, userController.updateSkills);

router.post(
  "/courses",
  getLoggedInUser,
  (req, res, next) => {
    uploadCourse.single("video")(req, res, (err) => {
      if (err) {
        console.error("[MULTER ERROR] course video:", err);
        return res.status(500).json({ success: false, message: err.message });
      }
      next();
    });
  },
  userController.addCourse
);

router.get("/all", userController.getAllUsers);
router.get("/:id", getLoggedInUser, userController.getUserById);

/* PHASE 9 – DELETE ROUTES */
router.delete("/profile", getLoggedInUser, userController.deleteOwnProfile);
router.delete("/:id", getLoggedInUser, requireAdmin, userController.adminDeleteUser);

export default router;
