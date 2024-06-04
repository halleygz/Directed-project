import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// token generator
// const generateTokenAndCookie = (userId, res) =>{
//     const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET)
//     res.cookie("token", token, {httpOnly: true})
// }

// login controller
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid Cridentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Cridentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });
    //figure out a way to create dynamic route using the username
    res.redirect("/username");
  } catch (error) {
    console.log(error);
  }
};

//signup controller
export const signup = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const newUser = await User.create({ username, password: hashedPassword });
      //figure out a way to create dynamic route using the username
      await newUser.save();
      res.redirect("/login");
    } catch (error) {
      if ((error.code = 11000)) {
        res.status(409).json({ message: "User alreade exists" });
      }
      res.status(500).json({ message: "internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
};

//logout
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
};
