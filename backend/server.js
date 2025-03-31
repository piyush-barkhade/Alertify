const express = require("express");
const connectDB = require("./config/db.js");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use("/auth", require("./routes/authRoutes"));
app.use("/sos", require("./routes/sosRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
