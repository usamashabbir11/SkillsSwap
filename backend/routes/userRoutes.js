import express from "express";
import userController from "../controllers/userController.js";
import getLoggedInUser from "../middlewares/userMiddleware.js";

const router = express.Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

router.get("/profile", getLoggedInUser, userController.getProfile);
router.put("/profile", getLoggedInUser, userController.updateProfile);

/* STATIC ROUTE FIRST */
router.get("/all", getLoggedInUser, userController.getAllUsers);

/* DYNAMIC ROUTE LAST */
router.get("/:id", getLoggedInUser, userController.getUserById);

export default router;
