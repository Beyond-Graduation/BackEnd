require("dotenv").config(); // load .env variables
const { Router } = require("express"); // import router from express
const bcrypt = require("bcryptjs"); // import bcrypt to hash passwords
const jwt = require("jsonwebtoken"); // import jwt to sign tokens
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware


const router = Router(); // create router to create route bundle

// Signup route to create a new user
router.post("/signup", async(req, res) => {
    const { Student } = req.context.models;
    const { User } = req.context.models;
    try {
        var alreadyExists = await User.findOne({ email: req.body.email }).lean();
        if (alreadyExists) {
            return res.status(400).send({
                message: 'An account already exists with this email ID! Kindly Log In if you have already registered.'
            });

        } else {
            alreadyExists = await Student.findOne({ admissionId: req.body.admissionId }).lean();
            if (alreadyExists) {
                return res.status(400).send({
                    message: 'An account already exists with this admission ID ! Kindly recheck and contact CETAA if you think there is a conflict'
                });
            } else {
                // hash the password
                req.body.password = await bcrypt.hash(req.body.password, 10);
                req.body.updated = Date.now()
                    // create a new user
                await Student.create(req.body);
                var user = await Student.findOne({ userId: req.body.userId }).lean();
                const totalFields = 14
                var emptyFields = 0
                const exclusions = ["bookmarkBlog", "favAlumId", "__v"]
                for (const key of Object.keys(user)) {
                    if (user[key] || exclusions.includes(key)) {} else {
                        emptyFields++
                    }
                }
                req.body.profileCompletionPerc = parseInt(100 - ((emptyFields / totalFields) * 100))
                await Student.updateOne({ userId: user.userId }, req.body);

                user = await Student.findOne({ userId: user.userId }).lean();
                res.json(user);

            }
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});

// Login route to verify a user and get a token
router.post("/update", isLoggedIn, async(req, res) => {
    const curUserId = req.user.userId;
    const { Student } = req.context.models;
    try {
        // check if the user exists
        var user = await Student.findOne({ userId: curUserId }).lean();
        req.body.updated = Date.now()
        if (user) {
            await Student.updateOne({ userId: curUserId }, req.body);
            user = await Student.findOne({ userId: curUserId }).lean();
            console.log(user)
            const totalFields = 14
            var emptyFields = 0
            const exclusions = ["bookmarkBlog", "favAlumId", "__v"]
            for (const key of Object.keys(user)) {
                if (user[key] || exclusions.includes(key)) {} else {
                    emptyFields++
                }
            }
            req.body.profileCompletionPerc = parseInt(100 - ((emptyFields / totalFields) * 100))
            await Student.updateOne({ userId: user.userId }, req.body);
            // send updated user as response
            user = await Student.findOne({ userId: curUserId });
            res.json(user);
        } else {
            res.status(400).json({ error: "Student doesn't exist" });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});


router.get("/student_list", isLoggedIn, async(req, res) => {
    const { Student } = req.context.models;
    if (req.query.department) {
        var dept = req.query.department
        console.log("Department:", dept)
        res.json(
            await Student.find({ department: dept }).lean().collation({ 'locale': 'en' }).sort({ firstName: 1, lastName: 1, dateJoined: -1, updated: -1 }).catch((error) =>
                res.status(400).json({ error })
            )
        );
    } else if (req.query.sort == "name") {
        res.json(
            await Student.find()
            .lean().collation({ 'locale': 'en' }).sort({ firstName: 1, lastName: 1, dateJoined: -1, updated: -1 })
            .catch((error) => res.status(400).json({ error }))
        );

    } else if (req.query.sort == "latest") {
        res.json(
            // likes:-1 => descending , dateUploaded:-1 ==> latest
            await Student.find()
            .lean().collation({ 'locale': 'en' }).sort({ dateJoined: -1, updated: -1 })
            .catch((error) => res.status(400).json({ error }))
        );

    } else if (req.query.sort == "oldest") {
        res.json(
            // dateUploaded:1 ==> oldest
            await Student.find()
            .lean().collation({ 'locale': 'en' }).sort({ dateJoined: 1, updated: 1 })
            .catch((error) => res.status(400).json({ error }))
        );
        return;

    } else {
        res.json(
            await Student.find()
            .lean().collation({ 'locale': 'en' }).sort({ firstName: 1, lastName: 1, dateJoined: -1, updated: -1 })
            .catch((error) => res.status(400).json({ error }))
        );
    }
});


router.get("/student_details", isLoggedIn, async(req, res) => {
    const { Student } = req.context.models;
    if (req.query.userId) {
        var curUserId = req.query.userId
        console.log("User Id:", curUserId)
        res.json(
            await Student.findOne({ userId: curUserId }).catch((error) =>
                res.status(400).json({ error })
            )
        );
    }

});

// Route to add favorite alumni
router.post("/favAlumAdd", isLoggedIn, async(req, res) => {
    const curUserId = req.user.userId;
    const newAlumId = req.body.alumId;
    const { Student } = req.context.models;
    try {
        // check if the user exists
        const user = await Student.findOne({ userId: curUserId });
        req.body.updated = Date.now()
        var curFavAlums = user.favAlumId

        if (user && curFavAlums.includes(newAlumId) == false) {
            curFavAlums.push(newAlumId)
                // console.log(curFavAlums)
            await Student.updateOne({ userId: curUserId }, { favAlumId: curFavAlums });
            // send updated user as response
            const user = await Student.findOne({ userId: curUserId });
            res.json(user);
        } else {
            curFavAlums = curFavAlums.filter((x) => x !== newAlumId);
            await Student.updateOne({ userId: curUserId }, { favAlumId: curFavAlums });
            // send updated user as response
            const user = await Student.findOne({ userId: curUserId });
            res.json(user);
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({ error });
    }
});

// Route to get favorite alumni list
router.get("/favAlumlist", isLoggedIn, async(req, res) => {
    const curUserId = req.user.userId;
    const { Student } = req.context.models;
    try {
        // check if the user exists
        const user = await Student.findOne({ userId: curUserId });


        if (user) {
            var curFavAlums = user.favAlumId
            console.log(curFavAlums)
            res.json(curFavAlums);

        } else {
            res.status(400).json({ error: curUserId + " Does Not exist" });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});

// Route to add bookmarks
router.post("/bookmark", isLoggedIn, async(req, res) => {
    const curUserId = req.user.userId;
    const newblogId = req.body.blogId;
    const { Student } = req.context.models;
    try {
        // check if the user exists
        const user = await Student.findOne({ userId: curUserId });
        req.body.updated = Date.now()
        var curBookmarkBlogs = user.bookmarkBlog

        if (user && curBookmarkBlogs.includes(newblogId) == false) {
            curBookmarkBlogs.push(newblogId)
            console.log(curBookmarkBlogs)
            await Student.updateOne({ userId: curUserId }, { bookmarkBlog: curBookmarkBlogs });
            // send updated user as response
            const user = await Student.findOne({ userId: curUserId });
            res.json(user);

        } else {
            res.status(400).json({ error: newblogId + " is already Bookmarked!" });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});

// Route toget bookmarks
router.get("/bookmarklist", isLoggedIn, async(req, res) => {
    const curUserId = req.user.userId;
    const { Student } = req.context.models;
    try {
        // check if the user exists
        const user = await Student.findOne({ userId: curUserId });


        if (user) {
            var curBookmarkBlogs = user.bookmarkBlog
            console.log(curBookmarkBlogs)
            res.json(curBookmarkBlogs);

        } else {
            res.status(400).json({ error: curUserId + " Does Not exist" });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});

module.exports = router;