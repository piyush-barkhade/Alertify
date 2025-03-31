const express = require("express");
const connectDB = require("./config/db.js");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());

// ✅ Restrict CORS to Frontend URL
app.use(
  cors({
    origin: "https://alertify-symf.onrender.com", // Frontend URL from environment variable
    credentials: true, // Allow sending cookies and authorization headers
  })
);

connectDB();

app.use("/auth", require("./routes/authRoutes"));
app.use("/sos", require("./routes/sosRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
