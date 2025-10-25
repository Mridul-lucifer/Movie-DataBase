require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRouter = require('./Routes/userRoute.js');
const dataRouter = require('./Routes/dataRoute.js');
const pool = require('./db.js'); // ✅ Use shared connection

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', userRouter);
app.use('/api/movies', dataRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
