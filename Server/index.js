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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
