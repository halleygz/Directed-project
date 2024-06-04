import express from "express";
import Post from "../models/Post.js";

//this will change to a single list of posts page
export const allPosts = async (req, res) => {
  try {
    const locals = {
      title: "Home",
      description: "Welcome to blogger",
    };
    let perPage = 10;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const count = await Post.countDocuments({});
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);
    res.render("allposts", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.log(error);
  }
};

//single post page
export const aPost = async (req, res) => {
  try {
    let slug = req.params.id;
    const data = await Post.findById({ _id: slug });
    const locals = {
      title: data.title,
      description: "something here",
    };
    res.render("post", { locals, data });
  } catch (error) {
    console.log(error);
  }
};

// search functionality
export const search = async (req, res) => {
  try {
    const locals = {
      title: "search",
      description:
        "just starting to learn some express staff cause me found it easier",
    };
    let searchTerm = req.body.searchTerm;
    const searchNoSpecial = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecial, "i") } },
        { body: { $regex: new RegExp(searchNoSpecial, "i") } },
      ],
    });

    res.render("search", { locals, data });
  } catch (error) {
    console.log(error);
  }
};
