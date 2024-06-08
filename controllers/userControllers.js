const User = require("../models/User");
const Blog = require("../models/Blog");
const { Comment } = require("../models/Comment");
const bcrypt = require("bcrypt");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const secret = process.env.JWT_SECRET;
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

module.exports.user_get = (req, res) => {
  res.render("userhome");
};

module.exports.blog_post = async (req, res) => {
  const { title, content } = req.body;
  let user = "";
  const token = req.cookies.jwt;
  jwt.verify(token, secret, async (err, decodedToken) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log(decodedToken);
      user = decodedToken.id;
    }
  });
  try {
    const blog = await Blog.create({
      authorId: user,
      title,
      content,
    });
    res.status(201).json({ blog });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(401).json(errors);
  }
};

module.exports.comment_post = async (req, res) => {
  const blogId = req.params.id;
  const { content } = req.body;
  let userId = "";
  const token = req.cookies.jwt;
  jwt.verify(token, secret, async (err, decodedToken) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log(decodedToken);
      userId = decodedToken.id;
    }
  });
  const user = await User.findById(userId);
  try {
    const comments = await Comment.create({
      commenter: user.username,
      content,
    });
    const updateBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: {
          commenters: {
            commenter: user.username,
            content,
          },
        },
      },
      { new: true, runValidators: true }
    );
    console.log(comments, updateBlog);
    res.status(201).json({ comments, updateBlog });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(401).json(errors);
  }
};
module.exports.allBlogs = async (req, res) => {
  try {
    let perPage = 10;
    let page = req.query.page || 1;
    const data = await Blog.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const count = await Blog.countDocuments({});
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);
    res.locals.data = data;
    res.render("allblogs", {
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (err) {
    console.log(err);
  }
};
module.exports.aBlog = async (req, res) => {
  try {
    const data = await Blog.findById({ _id: req.params.id });
    const locals = {
      title: data.title,
      description: "descriptin",
    };
    res.render("singleblog", {
      locals,
      data,
    });
  } catch (err) {
    console.log(err);
  }
};
module.exports.my_blogs = async (req, res) => {
  try {
    let userId = "";
    const token = req.cookies.jwt;
    jwt.verify(token, secret, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log(decodedToken);
        userId = decodedToken.id;
      }
    });
    const data = await Blog.aggregate([
      { $sort: { authorId: 1 } },
      {
        $group: {
          _id: "$authorId",
          document: { $first: "$$ROOT" },
        },
      },
    ]);
    // console.log(data);
    //res.locals.data = data;
    res.render("myblogs", {
      data,
    });
  } catch (err) {
    console.log(err);
  }
};
//edit post
// edit post get
module.exports.edit_blog = async (req, res) => {
  try {
    const locals = {
      title: Blog.title,
      description: Blog.content,
    };
    let userId = "";
    const token = req.cookies.jwt;
    jwt.verify(token, secret, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log(decodedToken);
        userId = decodedToken.id;
      }
    });
    const paramId = req.params.id;
    const data = await Blog.findById({ _id: paramId });
    console.log(userId, data.authorId.toString())
    if (userId === data.authorId.toString()) {
      res.render("edit-post", { data });
    } else {
      console.log(`can't edit this post`);
      res.redirect(`/blog/${paramId}`);
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports.edit_blog_put = async(req, res)=>{
  try {
    const {title, content} = req.body
    console.log(title,content)
    await Blog.findByIdAndUpdate(req.param.id, {
      title,
      content,
      unpdatedAt: Date.now()
    })
  } catch (err) {
    console.log(err)
  }
}