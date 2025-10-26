import path from "path";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// Your API routes
app.use("/auth", userRouter);
app.use("/api/movies", dataRouter);

// 🪄 Serve frontend build (for Vite or React)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../client/dist"))); // adjust path if needed

// ⚙️ Handle React Router routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
