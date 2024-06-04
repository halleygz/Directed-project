import express from "express";
import { ReturnDocument } from "mongodb";
import { aPost, home, search } from "../controllers/home.controller.js";

const router = express.Router();

//home
router.get("/", home);

//about
router.get("/about", (req, res) => {
  res.render("about");
});
//contact
router.get("/contact", (req, res) => {
  res.render("contact");
});

//single post
router.get("/post/:id", aPost)

//search 
router.post("/search", search)
export default router;