const User = require("../models/User");
const Blog = require("../models/Blog");
const { Comment } = require("../models/Comment");
const bcrypt = require("bcrypt");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { userInfo } = require("os");
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
    // res.redirect(`/blog/${blog._id}`)
    res.status(200).json({ blog });
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
    res.status(200).json({ comments, updateBlog });
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
    let currentUser = "";
    const token = req.cookies.jwt;
    jwt.verify(token, secret, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log(decodedToken);
        currentUser = decodedToken.id;
      }
    });
    const locals = {
      title: data.title,
      description: "descriptin",
    };
    res.render("singleblog", {
      locals,
      data,
      currentUser,
    });
  } catch (err) {
    console.log(err);
  }
};
module.exports.my_blogs = async (req, res) => {
  try {
    let authorId = "";
    const token = req.cookies.jwt;
    jwt.verify(token, secret, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log(decodedToken);
        authorId = decodedToken.id;
      }
    });
    const data = await Blog.find({ authorId: authorId }).sort({
      createdAt: -1,
    });
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
    console.log(userId, data.authorId.toString());
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

module.exports.edit_blog_put = async (req, res) => {
  try {
    const { title, content } = req.body;
    console.log(title, content);
    await Blog.findByIdAndUpdate(req.param.id, {
      title,
      content,
      unpdatedAt: Date.now(),
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.liked_post = async (req, res) => {
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
  const blog = await Blog.findById(req.params.id);

  if (!blog.likedBy.includes(user) && !blog.dislikedBy.includes(user)) {
    blog.likes += 1;
    blog.likedBy.push(user);
    await blog.save();
  }
  res.json({ likes: blog.likes });
};

module.exports.disliked_post = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
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
  if (!blog.likedBy.includes(user) && !blog.dislikedBy.includes(user)) {
    blog.dislikes += 1;
    blog.dislikedBy.push(user);
    await blog.save();
  }
  res.json({ dislikes: blog.dislikes });
};
module.exports.search = async (req, res) => {
  try {
    const locals = {
      title: "search",
      description: "searching...",
    };
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
    let { searchTerm } = req.body;
    const searchNoSpecial = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
    const data = await Blog.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecial, "i") } },
        { content: { $regex: new RegExp(searchNoSpecial, "i") } },
      ],
    });
    res.render("search", { locals, data,user });
  } catch (error) {
    console.log(error);
  }
};
