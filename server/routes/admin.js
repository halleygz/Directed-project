import express from "express";
import Post from "../models/Post.js";
import bcrypt from "bcrypt";
//take these to middleware folder under middleware function
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const router = express.Router();

const middleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message:
        "The heck are you doing here?? No spot for you, off you go!!!!!!!",
    });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Not again babe, shoot, shoot shoot",
    });
  }
};
///




//take these under controllers dir
// use the libraries: import bcrypt from "bcrypt";
// import User from "../models/User.js";
// instead of /admin use /username
// add the middleware to this route


//auth routes
router.get("/admin", async (req, res) => {
  // log in page layout
  try {
    const locals = {
      title: "Admin",
      description: "flenn",
    };
    res.render("admin/index", { locals, layout: "./layouts/admin" });
  } catch (error) {
    console.log(error);
  }
});

// use the route /login check login
// add it to auth controller
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid cridentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid cridentials" });
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/register");
    // res.render("admin/index", { locals, layout: "./layouts/admin" });
  } catch (error) {
    console.log(error);
  }
});
router.get("/register", middleware, async (req, res) => {
  //sign up page layout
    try {
      const locals = {
        title: "Register",
        description: "flenn",
      };
      res.render("admin/register", { locals, layout: "./layouts/admin" });
    } catch (error) {
      console.log(error);
    }
  });
//user register controller remove middleware
router.post("/register", middleware, async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedpassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password: hashedpassword });
      res.status(201).json({ message: "User Created", user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "User already in use" });
      }
      res.status(500).json({ messge: "internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
});

//logout controller
router.get('/logout', middleware, async (req, res) => {
  res.clearCookie('token')
  res.redirect('/')
})



// user routes
// change route name to /username -----user page layout
router.get("/dashboard", middleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "admin dash",
    };
    const data = await Post.find();
    res.render("admin/dashboard", { locals, data, layout: "./layouts/admin" });
  } catch (error) {
    console.log(error);
  }
});

// user posting layout
// route = /username/post
router.get("/admin-post", middleware, async (req, res) => {
  // put this under user conroller
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
// user post controller
router.post("/admin-post", middleware, async (req, res) => {
  // send post to db
  try {
    const nPost = new Post({
      title: req.body.title,
      body: req.body.body,
    });
    await Post.create(nPost);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});
//user posts edit layout
router.get("/edit-post/:id", middleware, async (req, res) => {
  // use /username/posts/:id
  try {
    const locals = {
      title: Post.title,
      description: Post.body,
    };
    const data = await Post.findOne({ _id: req.params.id });

    res.render("admin/edit-post", {
      data,
      locals,
      layout: "./layouts/admin",
    });
  } catch (error) {
    console.log(error);
  }
});
router.put("/edit-post/:id", middleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });
    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
  }
});
router.delete("/delete-post/:id", middleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect(`/dashboard`);
  } catch (error) {
    console.log(error);
  }
});

export default router
