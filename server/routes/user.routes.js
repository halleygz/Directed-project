import express from "express";
import { middleware } from "../middleware/middleware.js";
import Post from "../models/Post.js";
import {
  delPost,
  editPost,
  editPostLayout,
  newPost,
} from "../controllers/user.controller.js";
// import middleware here

const router = express.Router();

//user dashboard: renders all posts from authorised user id
router.get("/username", middleware, async (req, res) => {
  try {
    const locals = {
      title: "user dashboard",
      description: "user dash",
    };
    const data = await Post.find();
    res.render("admin/dashboard", { locals, data, layout: "./layouts/admin" });
  } catch (error) {
    console.log(error);
  }
});

// user new post page
router.get("/username/post", middleware, async (req, res) => {
  try {
    const locals = {
      title: "Admin Post",
      description: "admin dash",
    };
    res.render("admin/admin-post", { locals, layout: "./layouts/admin" });
  } catch (error) {
    console.log(error);
  }
});
router.post("/username/post", middleware, newPost);
router.get("/username/edit-post/:id", middleware, editPostLayout);
router.put("/username/edit-post/:id", middleware, editPost);
router.delete("/username/delete-post/:id", middleware, delPost);

export default router