const { Router } = require("express");
const { user_get, blog_post, comment_post, allBlogs, aBlog, my_blogs, edit_blog, edit_blog_put } = require("../controllers/userControllers");
const router = Router()
router.get("/user", user_get);
router.post("/post-blog", blog_post)
router.get("/allblogs", allBlogs)
router.get("/myblogs", my_blogs)
router.get("/blog/:id", aBlog)
router.get("/blog/edit/:id",edit_blog)
router.put("/blog/edit/:id",edit_blog_put)
router.post("/blog/:id/comment", comment_post)
module.exports = router