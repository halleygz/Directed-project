const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const methodOverride = require('method-override')
const dotenv = require("dotenv");
const connectDB = require('./config/db')
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { requireAuth, checkUser } = require("./middleware/authMiddleware");
dotenv.config();

const app = express();

// middleware
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));

// view engine
app.set("view engine", "ejs");

//configs
dotenv.config();
const PORT = 5000 || process.env.PORT;
connectDB();

//routes
app.get("*", checkUser);
app.get("/", (req, res) => res.render("home"));
app.use(authRoutes);
app.use(requireAuth, userRoutes);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
