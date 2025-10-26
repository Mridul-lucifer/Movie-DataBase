const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRouter = require("./Routes/userRoute");
const dataRouter = require("./Routes/dataRoute");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ API routes
app.use("/auth", userRouter);
app.use("/api/movies", dataRouter);

// ✅ Serve frontend build
app.use(express.static(path.join(__dirname, "../client/dist")));

// ✅ Catch-all route for React Router (works in Express 5)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
