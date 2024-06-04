import Post from "../models/Post.js";

// send new post to db
export const newPost = async(req, res) => {
    try {
        const nPost = new Post({
          title: req.body.title,
          body: req.body.body,
        });
        await Post.create(nPost);
        res.redirect("/username");
      } catch (error) {
        console.log(error);
      }
}

//edit post
export const editPostLayout = async(req, res)=>{
    try {
        const locals = {
          title: Post.title,
          description: Post.body,
        };
        const data = await Post.findOne({ _id: req.params.id });
    
        res.render("username/edit-post", {
          data,
          locals,
          layout: "./layouts/user",
        });
      } catch (error) {
        console.log(error);
      }
}
export const editPost = async(req, res)=>{
    try {
        await Post.findByIdAndUpdate(req.params.id, {
          title: req.body.title,
          body: req.body.body,
          updatedAt: Date.now(),
        });
        res.redirect(`/username/edit-post/${req.params.id}`);
      } catch (error) {
        console.log(error);
      }
}

//delete post
export const delPost = async(req,res)=>{
    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect(`/username`);
      } catch (error) {
        console.log(error);
      }
}