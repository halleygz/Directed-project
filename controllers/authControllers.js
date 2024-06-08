const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv')
dotenv.config()
const secret = process.env.JWT_SECRET
//handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = {
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  };
  if (err.message === "incorrect cridentials") {
    errors.username = "incorrect cridentials";
  }

  // duplicate error code
  if (err.message.includes("E11000 duplicate key error collection")) {
    const msg = Object.values(err.errorResponse)[4];
    const property = msg.hasOwnProperty("email") ? "email" : "username";
    const respond =
      property === "email" ? "email already in use" : "username already in use";
    errors[property] = respond;
  }

  //validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
    console.log(errors);
  }
  return errors;
};
const maxAge = 3 * 24 * 68 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, secret, {
    expiresIn: maxAge,
  });
};
module.exports.signup_get = (req, res) => {
  res.render("signup");
};
module.exports.login_get = (req, res) => {
  res.render("login");
};
module.exports.signup_post = async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  //   const hashedPassword = await bcrypt.hash(password, salt);
  try {
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password,
    });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(401).json(errors);
  }
};
module.exports.login_post = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.login(username, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
