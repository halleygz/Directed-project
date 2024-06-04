import express from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";

const router = express.Router();
//login route
router.get("/login", async (req, res) => {
  try {
    const locals = {
      title: "Login",
      description: "Login page",
    };
    //rename admin folder user folder and admin/indext to login
    //change admin layout to login layout
    res.render("/login", { locals, layout: "./layouts/main" });
  } catch (error) {
    console.log(error);
  }
});
router.post("/login", login);

// signup route
router.get("/signup", async (req, res) => {
  try {
    const locals = {
      title: "Signup",
      description: "Signup page layout",
    };
    //rename admin folder  to 'user' and admin/index to 'user/login'
    //change admin layout to login layout
    res.redirect("/signup", { locals, layout: "./layouts/main" });
  } catch (error) {
    console.log(error);
  }
});
router.post("/signup", signup);
router.get("/logout", logout);
export default router;