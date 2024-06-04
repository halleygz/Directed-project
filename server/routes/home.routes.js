import express from "express";
import { ReturnDocument } from "mongodb";
import { aPost,  allPosts,  search } from "../controllers/home.controller.js";

const router = express.Router();

//home
router.get("/", (req, res) =>{
  res.render("index")
});
router.get("/allposts", allPosts);

//about
router.get("/login", (req, res) => {
  res.render("login");
});
//contact
router.get("/signup", (req, res) => {
  res.render("signup");
});

//single post
router.get("/post/:id", aPost)

//search 
router.post("/search", search)
export default router;