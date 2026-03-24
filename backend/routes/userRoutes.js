import express from "express";
import multer from "multer";
import userController from "../controllers/userController.js";
import getLoggedInUser, { requireAdmin } from "../middlewares/userMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

router.get("/profile", getLoggedInUser, userController.getProfile);
router.put("/profile", getLoggedInUser, userController.updateProfile);

/* ✅ IMAGE UPLOAD ROUTES (THIS WAS MISSING) */
router.put(
  "/profile/image",
  getLoggedInUser,
  upload.single("image"),
  userController.uploadProfileImage
);

router.put(
  "/profile/cover",
  getLoggedInUser,
  upload.single("image"),
  userController.uploadCoverImage
);

router.put("/skills", getLoggedInUser, userController.updateSkills);

router.post(
  "/courses",
  getLoggedInUser,
  upload.single("video"),
  userController.addCourse
);

router.get("/all", getLoggedInUser, userController.getAllUsers);
router.get("/:id", getLoggedInUser, userController.getUserById);

/* PHASE 9 – DELETE ROUTES */
router.delete("/profile", getLoggedInUser, userController.deleteOwnProfile);
router.delete("/:id", getLoggedInUser, requireAdmin, userController.adminDeleteUser);

export default router;
