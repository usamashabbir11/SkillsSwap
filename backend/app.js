import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userRoutes.js";
import swapRoutes from "./routes/swapRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/users", userRoutes);
app.use("/swaps", swapRoutes);
app.use("/notifications", notificationRoutes);
app.use("/reviews", reviewRoutes);
app.use("/admin", adminRoutes);

export default app;
