import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

/* serve uploaded images */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/users", userRoutes);

export default app;
