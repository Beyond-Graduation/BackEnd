const { Router } = require("express"); // import Router from express
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
const { isAlumniLoggedIn } = require("./middleware"); // import isAlumniLoggedIn custom middleware
const { isAdminLoggedIn } = require("./middleware");
const { performWord2VecEmbedding } = require("../functions/textEmbedding.js");
const { htmlToText } = require('html-to-text');
const cosineSimilarity = require('cosine-similarity');

const router = Router();
const logger = require("../logging/logger")

//custom middleware could also be set at the router level like so
// router.use(isLoggedIn) then all routes in this router would be protected

// Index Route with isLoggedIn middleware
router.get("/", isLoggedIn, async(req, res) => {
    const { Blog } = req.context.models;
    const { User } = req.context.models;
    if (req.query.blogId) {
        var curBlogId = req.query.blogId;

        var blog = await Blog.findOne({ blogId: curBlogId }, { vector: 0 })
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
            blogIndex = visitedUser.blogClicks.findIndex((obj => obj.blogId == req.query.blogId));
            visitedUser.blogClicks[blogIndex].count++;
            visitedUser.blogClicks[blogIndex].lastClick = Date.now();
            await User.updateOne({ userId: curUserId }, { blogClicks: visitedUser.blogClicks });
        } else {
            visitedUser = await User.findOne({ userId: curUserId }).lean();
            visitedUser.blogClicks.push({ blogId: req.query.blogId, count: 1 });
            await User.updateOne({ userId: curUserId }, { blogClicks: visitedUser.blogClicks });
        }


        await Blog.updateOne({ blogId: req.query.blogId }, { $inc: { clicks: 1 } });
        res.json(blog);
        // Increasing Blog click count


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

router.get("/recommend", isLoggedIn, async(req, res) => {
    const { Blog } = req.context.models;
    const { User } = req.context.models;
    try {
        const blogId = req.query.blogId;
        const currentArticle = await Blog.findOne({ blogId }).select('vectorEmbedding');

        if (!currentArticle) {
            throw new Error('Current article not found');
        }

        const articles = await Blog.find({ blogId: { $ne: blogId } }).select('blogId title abstract imagePath firstName lastName likes vectorEmbedding');

        // Calculate cosine similarity for all articles
        const similarities = articles.map(article => ({
            blogId: article.blogId,
            title: article.title,
            abstract: article.abstract,
            imagePath: article.imagePath,
            firstName: article.firstName,
            lastName: article.lastName,
            likes: article.likes,
            similarity: cosineSimilarity(currentArticle.vectorEmbedding, article.vectorEmbedding)
        }));

        // Sort the articles based on similarity in descending order
        similarities.sort((a, b) => b.similarity - a.similarity);

        // Get the top 5 most similar articles
        const relatedArticles = similarities.slice(0, 5);

        res.json({ relatedArticles });
    } catch (error) {
        res.status(400).json({ error: `Error : ${error.message}` });
    }
});



// create Route with isLoggedIn middleware
router.post("/create", isAlumniLoggedIn, async(req, res) => {
    const { Blog } = req.context.models;
    const { Alumni } = req.context.models;
    const curUserId = req.user.userId;
    const user = await Alumni.findOne({ userId: curUserId }).lean();
    req.body.userId = curUserId;
    req.body.firstName = user.firstName;
    req.body.lastName = user.lastName;

    try {

        // Convert HTML to plain text
        const plainTextContent = htmlToText(req.body.content);
        // Embed the blog content using Word2Vec
        const vectorEmbedding = await performWord2VecEmbedding(plainTextContent);

        // Add the embedded vector to the request body
        req.body.vectorEmbedding = vectorEmbedding;

        // Create the new blog entry with the embedded vector
        let blog = await Blog.create(req.body);
        logger.info(`Blog ${req.body.blogId} created`,{ userId: req.user.userId })
        res.send("Created");
    } catch (error) {
        logger.error("Error with blog creation",{userId: req.user.userId})
        res.status(400).json({ error: `Error : ${error.message}` });
    }
});



router.post("/update", isAlumniLoggedIn, async(req, res) => {
    const curUserId = req.user.userId;
    const { Blog } = req.context.models;
    try {
        // check if the user exists
        var blog = await Blog.findOne({ blogId: req.body.blogId }).lean();
        req.body.dateModified = Date.now();
        if (blog && blog.userId == curUserId) {

            if (req.body.content) {
                // Convert HTML to plain text
                const plainTextContent = htmlToText(req.body.content);
                // Embed the blog content using Word2Vec
                const vectorEmbedding = await performWord2VecEmbedding(plainTextContent);
                // Add the embedded vector to the request body
                req.body.vectorEmbedding = vectorEmbedding;
            }
            blog = await Blog.updateOne({ blogId: blog.blogId }, req.body);
            logger.info(`Blog ${req.body.blogId} updated`,{ userId: req.user.userId })
            res.send("Updated");
        } else {
            res.status(400).json({
                error: "Blog doesn't exist or is not published by the Current user ",
            });
            logger.error(`Blog ${req.body.blogId} doesn't exist or is not published by the Current user`,{userId: req.user.userId})
        }
    } catch (error) {
        logger.error("Error with blog updation",{ userId: req.user.userId })
        res.status(400).json({ error: `Error : ${error.message}` });
    }
});


// Route to Set New Embeddings to all existing articles
router.post("/updateAll", isAdminLoggedIn, async(req, res) => {
    const curUserId = req.user.userId;
    const { Blog } = req.context.models;
    try {
        var blogs = await Blog.find().lean();
        for (let i = 0; i < blogs.length; i++) {
            let blog = blogs[i];
            // req.body.dateModified = Date.now();

            // Convert HTML to plain text
            const plainTextContent = htmlToText(blog.content);
            // Embed the blog content using Word2Vec
            const vectorEmbedding = await performWord2VecEmbedding(plainTextContent);
            console.log(vectorEmbedding);
            blog = await Blog.updateOne({ blogId: blog.blogId }, { "$set": { 'vectorEmbedding': vectorEmbedding } });
        }
        logger.info(`Admin profile ${req.user.userId} updated all blogs`,{ userId: req.user.userId })
        res.send("Updated All Blogs");
    } catch (error) {
        logger.error("Error with updating all blogs",{userId: req.user.userId})
        res.status(400).json({ error: `Error : ${error.message}` });
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

            user.likedBlogs.push(req.body.blogId);
            await User.updateOne({ userId: curUserId }, { likedBlogs: user.likedBlogs });
            user = await User.findOne({ userId: curUserId }).lean();
            await Blog.updateOne({ blogId: req.body.blogId }, { likes: blog.likes });
            blog = await Blog.findOne({ blogId: req.body.blogId }).lean();
            res.json({ message: "Liked Blog" });
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
            res.json({ message: "Disliked Blog" });
        }

    } catch (error) {
        res.status(400).json({ error: `Error : ${error.message}` });
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
            res.json({ message: "Bookmarked Blog" });
        } else {
            curBookmarkBlogs = curBookmarkBlogs.filter((x) => x !== newblogId);
            await User.updateOne({ userId: curUserId }, { bookmarkBlog: curBookmarkBlogs });
            const user = await User.findOne({ userId: curUserId });
            res.json({ message: "Removed Blog from Bookmarks" });
        }
    } catch (error) {
        res.status(400).json({ error: `Error : ${error.message}` });
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

        await BlogComments.create(req.body).catch((error) =>
            res.status(400).json({ error })
        );
        logger.info(`${user.__t} ${user.userId} added comment `,{ userId: user.userId })
        res.json({ message: "Added Comment" });
    } catch (error) {
        logger.error("Error with adding comments",{userId: req.user.userId})
        res.status(400).json({ error: `Error : ${error.message}` });
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
    logger.info(`Blog ${req.body.blogId} deleted by alumni`,{ userId: req.user.userId })
    await BlogComments.remove({ blogId: req.body.blogId });
    await User.updateMany({ bookmarkBlog: req.body.blogId }, { $pull: { bookmarkBlog: req.body.blogId } });
    await User.updateMany({ likedBlogs: req.body.blogId }, { $pull: { likedBlogs: req.body.blogId } });
    await Blog.remove({ blogId: req.body.blogId });
    // var peopleLiked = await User.find({ likedBlogs: req.body.blogId }).lean();

    res.send("Blog Deleted");
});

module.exports = router;