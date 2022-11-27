const { Router } = require("express"); // import Router from express
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
const { isAlumniLoggedIn } = require("./middleware"); // import isAlumniLoggedIn custom middleware

const router = Router();

//custom middleware could also be set at the router level like so
// router.use(isLoggedIn) then all routes in this router would be protected

// Index Route with isLoggedIn middleware
router.get("/", isLoggedIn, async (req, res) => {
  const { Blog } = req.context.models;
  if (req.query.blogId) {
    var curBlogId = req.query.blogId;
    blog = await Blog.findOne({ blogId: curBlogId })
      .lean()
      .catch((error) => res.status(400).json({ error }));
    const curUserId = req.user.userId;
    const { User } = req.context.models;
    var user = await User.findOne({ userId: curUserId }).lean();
    if (user.likedBlogs.includes(curBlogId) == true) {
      blog.isLiked = true;
    } else {
      blog.isLiked = false;
    }
    res.json(blog);
  } else {
    res.json(
      await Blog.find()
        .lean()
        .catch((error) => res.status(400).json({ error }))
    );
  }
});

// create Route with isLoggedIn middleware
router.post("/create", isAlumniLoggedIn, async (req, res) => {
  const { Blog } = req.context.models;
  const { Alumni } = req.context.models;
  const curUserId = req.user.userId;
  const user = await Alumni.findOne({ userId: curUserId }).lean(); // get username from req.user property created by isLoggedIn middleware
  req.body.userId = curUserId; // add userId property to req.body
  req.body.firstName = user.firstName;
  req.body.lastName = user.lastName;
  //create new todo and send it in response
  res.json(
    await Blog.create(req.body).catch((error) =>
      res.status(400).json({ error })
    )
  );
});

router.post("/update", isAlumniLoggedIn, async (req, res) => {
  const curUserId = req.user.userId;
  const { Blog } = req.context.models;
  try {
    // check if the user exists
    var blog = await Blog.findOne({ blogId: req.body.blogId }).lean();
    req.body.dateModified = Date.now();
    if (blog || blog.userId == curUserId) {
      blog = await Blog.updateOne({ blogId: req.body.blogId }, req.body);
      console.log(blog);
      res.json(blog);
    } else {
      res
        .status(400)
        .json({
          error: "Blog doesn't exist or is not published by the Current user ",
        });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/like", isLoggedIn, async (req, res) => {
  const curUserId = req.user.userId;
  const { Blog } = req.context.models;
  const { User } = req.context.models;
  var user = await User.findOne({ userId: curUserId }).lean();
  console.log(user.userId, user.likedBlogs);
  try {
    var blog = await Blog.findOne({ blogId: req.body.blogId }).lean();
    // check if the user exists
    if (user.likedBlogs.includes(req.body.blogId) == false) {
      blog.likes++;
      console.log(blog.likes)

      user.likedBlogs.push(req.body.blogId);
      await User.updateOne(
        { userId: curUserId },
        { likedBlogs: user.likedBlogs }
      );
      user = await User.findOne({ userId: curUserId }).lean();
      await Blog.updateOne({ blogId: req.body.blogId }, { likes: blog.likes });
      blog = await Blog.findOne({ blogId: req.body.blogId }).lean();
      // console.log(user.userId,user.likedBlogs)
    }
    // else{
    //   res.send("Already in the liked blogs of this user");
    // }
    // //Yet to complete the section for dislike
    else {
      blog.likes--;
      let likedBlogsUpdated = user.likedBlogs.filter(
        (x) => x !== req.body.blogId
      );
      await User.updateOne(
        { userId: curUserId },
        { likedBlogs: likedBlogsUpdated }
      );
      user = await User.findOne({ userId: curUserId }).lean();
      await Blog.updateOne({ blogId: req.body.blogId }, { likes: blog.likes });
      blog = await Blog.findOne({ blogId: req.body.blogId }).lean();
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/addComments", isLoggedIn, async (req, res) => {
  const curUserId = req.user.userId;
  const { BlogComments } = req.context.models;
  try {
    const { User } = req.context.models;
    const user = await User.findOne({ userId: curUserId }).lean();
    req.body.userId = curUserId; // add userId property to req.body
    req.body.firstName = user.firstName;
    req.body.lastName = user.lastName;
    req.body.userType = user.__t;

    req.body.dateUploaded = Date.now();
    console.log(req.body);
    if (req.body.parent) {
      var parentComment = await BlogComments.findOne({
        commentId: req.body.parent,
      });
      parentComment.childCommentCount++;
      await BlogComments.updateOne(
        { commentId: req.body.parent },
        { childCommentCount: parentComment.childCommentCount }
      );
    }
    res.json(
      await BlogComments.create(req.body).catch((error) =>
        res.status(400).json({ error })
      )
    );
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.get("/getComments", isLoggedIn, async (req, res) => {
  const { BlogComments } = req.context.models;
  if (req.query.parentId) {
    var curCommentId = req.query.parentId;
    res.json(
      await BlogComments.find({ parent: curCommentId })
        .lean()
        .catch((error) => res.status(400).json({ error }))
    );
  }
  else if (req.query.blogId) {
    var blogId = req.query.blogId;
    res.json(
      await BlogComments.find({ blogId: blogId , parent: null})
        .lean()
        .catch((error) => res.status(400).json({ error }))
    );
  } else {
    res.send("If you want parent comments of a blog, keep blogId in query, else if you want child comments of a parent comment, keep parentId in the query")
  }
});

module.exports = router;
