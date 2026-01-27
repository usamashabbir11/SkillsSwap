import express from "express";
import multer from "multer";
import userController from "../controllers/userController.js";
import getLoggedInUser from "../middlewares/userMiddleware.js";

const router = express.Router();

/* multer config */
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

/* image uploads */
router.put("/profile/image", getLoggedInUser, upload.single("image"), userController.updateProfileImage);
router.put("/profile/cover", getLoggedInUser, upload.single("image"), userController.updateCoverImage);

router.get("/all", getLoggedInUser, userController.getAllUsers);
router.get("/:id", getLoggedInUser, userController.getUserById);

export default router;
