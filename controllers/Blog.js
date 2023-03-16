const { Router } = require("express"); // import Router from express
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
const { isAlumniLoggedIn } = require("./middleware"); // import isAlumniLoggedIn custom middleware

const router = Router();

//custom middleware could also be set at the router level like so
// router.use(isLoggedIn) then all routes in this router would be protected

// Index Route with isLoggedIn middleware
router.get("/", isLoggedIn, async(req, res) => {
    const { Blog } = req.context.models;
    const { User } = req.context.models;
    if (req.query.blogId) {
        var curBlogId = req.query.blogId;

        var blog = await Blog.findOne({ blogId: curBlogId })
            .lean()
            .catch((error) => res.status(400).json({ error }));
        const curUserId = req.user.userId;
        var user = await User.findOne({ userId: curUserId }).lean();
        if (user.likedBlogs.includes(curBlogId) == true) {
            blog.isLiked = true;
        } else {
            blog.isLiked = false;
        }
        if (user.bookmarkBlog.includes(curBlogId) == true) {
            blog.isBookmarked = true;
        } else {
            blog.isBookmarked = false;
        }
        var visitedUser = await User.findOne({ userId: curUserId, blogClicks: { $elemMatch: { blogId: req.query.blogId } } }).lean();

        // Updating Clicks of each blog
        if (visitedUser) {
            console.log(visitedUser.blogClicks);
            blogIndex = visitedUser.blogClicks.findIndex((obj => obj.blogId == req.query.blogId));
            visitedUser.blogClicks[blogIndex].count++;
            visitedUser.blogClicks[blogIndex].lastClick = Date.now();
            console.log(visitedUser.blogClicks);
            await User.updateOne({ userId: curUserId }, { blogClicks: visitedUser.blogClicks });
        } else {
            visitedUser = await User.findOne({ userId: curUserId }).lean();
            visitedUser.blogClicks.push({ blogId: req.query.blogId, count: 1 });
            await User.updateOne({ userId: curUserId }, { blogClicks: visitedUser.blogClicks });
        }

        // Increasing Blog click count

        await Blog.updateOne({ blogId: req.query.blogId }, { $inc: { clicks: 1 } });
        res.json(blog);
    } else if (req.query.sort == "blogname") {
        res.json(
            // title:1 => ascending
            await Blog.find()
            .lean()
            .collation({ locale: "en" })
            .sort({ title: 1, dateUploaded: -1 })
            .catch((error) => res.status(400).json({ error }))
        );
    } else if (req.query.sort == "popular") {
        res.json(
            // likes:-1 => descending , dateUploaded:-1 ==> latest
            await Blog.find()
            .lean()
            .collation({ locale: "en" })
            .sort({ likes: -1, dateUploaded: -1 })
            .catch((error) => res.status(400).json({ error }))
        );
    } else if (req.query.sort == "latest") {
        res.json(
            // dateUploaded:-1 ==> latest
            await Blog.find()
            .lean()
            .collation({ locale: "en" })
            .sort({ dateUploaded: -1 })
            .catch((error) => res.status(400).json({ error }))
        );
    } else if (req.query.sort == "oldest") {
        res.json(
            // dateUploaded:1 ==> oldest
            await Blog.find()
            .lean()
            .collation({ locale: "en" })
            .sort({ dateUploaded: 1 })
            .catch((error) => res.status(400).json({ error }))
        );
    } else {
        res.json(
            await Blog.find()
            .lean()
            .collation({ locale: "en" })
            .sort({ dateUploaded: -1 })
            .catch((error) => res.status(400).json({ error }))
        );
    }
});

// create Route with isLoggedIn middleware
router.post("/create", isAlumniLoggedIn, async(req, res) => {
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

router.post("/update", isAlumniLoggedIn, async(req, res) => {
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
            res.status(400).json({
                error: "Blog doesn't exist or is not published by the Current user ",
            });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});

router.post("/like", isLoggedIn, async(req, res) => {
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
            console.log(blog.likes);

            user.likedBlogs.push(req.body.blogId);
            await User.updateOne({ userId: curUserId }, { likedBlogs: user.likedBlogs });
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
            await User.updateOne({ userId: curUserId }, { likedBlogs: likedBlogsUpdated });
            user = await User.findOne({ userId: curUserId }).lean();
            await Blog.updateOne({ blogId: req.body.blogId }, { likes: blog.likes });
            blog = await Blog.findOne({ blogId: req.body.blogId }).lean();
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ error });
    }
});

router.post("/bookmark", isLoggedIn, async(req, res) => {
    const curUserId = req.user.userId;
    const newblogId = req.body.blogId;
    const { User } = req.context.models;
    try {
        // check if the user exists
        const user = await User.findOne({ userId: curUserId });
        req.body.updated = Date.now();
        var curBookmarkBlogs = user.bookmarkBlog;

        if (user && curBookmarkBlogs.includes(newblogId) == false) {
            curBookmarkBlogs.push(newblogId);
            console.log(curBookmarkBlogs);
            await User.updateOne({ userId: curUserId }, { bookmarkBlog: curBookmarkBlogs });
            // send updated user as response
            const user = await User.findOne({ userId: curUserId });
            res.json(user);
        } else {
            curBookmarkBlogs = curBookmarkBlogs.filter((x) => x !== newblogId);
            await User.updateOne({ userId: curUserId }, { bookmarkBlog: curBookmarkBlogs });
            const user = await User.findOne({ userId: curUserId });
            res.json(user);
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});

router.post("/addComments", isLoggedIn, async(req, res) => {
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
            await BlogComments.updateOne({ commentId: req.body.parent }, { childCommentCount: parentComment.childCommentCount });
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

router.get("/getComments", isLoggedIn, async(req, res) => {
    const { BlogComments } = req.context.models;
    if (req.query.parentId) {
        var curCommentId = req.query.parentId;
        res.json(
            await BlogComments.find({ parent: curCommentId })
            .lean()
            .catch((error) => res.status(400).json({ error }))
        );
    } else if (req.query.blogId) {
        var blogId = req.query.blogId;
        res.json(
            await BlogComments.find({ blogId: blogId, parent: null })
            .lean()
            .catch((error) => res.status(400).json({ error }))
        );
    } else {
        res.send(
            "If you want parent comments of a blog, keep blogId in query, else if you want child comments of a parent comment, keep parentId in the query"
        );
    }
});

router.delete("/deleteBlog", isAlumniLoggedIn, async(req, res) => {

    // I/P blogId to be deleted

    const { Blog } = req.context.models;
    const { User } = req.context.models;
    const { BlogComments } = req.context.models;

    // Removing Blog Comments of the corresponding blog

    await BlogComments.remove({ blogId: req.body.blogId });
    await User.updateMany({ bookmarkBlog: req.body.blogId }, { $pull: { bookmarkBlog: req.body.blogId } });
    await User.updateMany({ likedBlogs: req.body.blogId }, { $pull: { likedBlogs: req.body.blogId } });
    await Blog.remove({ blogId: req.body.blogId });
    var peopleLiked = await User.find({ likedBlogs: req.body.blogId }).lean();

    res.json(peopleLiked);
});

module.exports = router;
