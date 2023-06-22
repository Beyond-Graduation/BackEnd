require("dotenv").config(); // load .env variables
const { Router } = require("express"); // import router from express
const bcrypt = require("bcryptjs"); // import bcrypt to hash passwords
const jwt = require("jsonwebtoken"); // import jwt to sign tokens
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
const { generateCombinations } = require("../functions/customQueryConstraints.js");
const { performWord2VecEmbedding } = require("../functions/textEmbedding.js");
const { pdfToText } = require("../functions/textEmbedding.js");
const cron = require('node-cron');
const axios = require('axios');
const router = Router(); // create router to create route bundle
const logger = require("../logging/logger")
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
                req.body.updated = Date.now();
                req.body.likedBlogs = [];
                let profileText = await pdfToText(req.body.resume);
                if (req.body.areasOfInterest) {
                    const interestsString = req.body.areasOfInterest.join(" ");
                    profileText = profileText + " " + interestsString;
                }

                req.body.vectorEmbedding = await performWord2VecEmbedding(profileText);
                // create a new user
                await Student.create(req.body);
                var user = await Student.findOne({ userId: req.body.userId }).lean();
                const totalFields = 14
                var emptyFields = 0
                const exclusions = ["bookmarkBlog", "favAlumId", "__v"]
                for (const key of Object.keys(user)) {
                    console.log(key, user[key])
                    if (user[key] || exclusions.includes(key)) {} else {
                        emptyFields++
                    }
                }
                req.body.profileCompletionPerc = parseInt(100 - ((emptyFields / totalFields) * 100))
                await Student.updateOne({ userId: user.userId }, req.body);
                logger.info('Student profile registered',{ userId: user.userId })
                res.json({ message: "Registration Successful" });

            }
        }
    } catch (error) {
        logger.error('Error with student profile registration')
        res.status(400).json({ error: `Error : ${error.message}` });
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
            if (req.body.resume || req.body.areasOfInterest) {


                let profileText = "";
                if (req.body.resume) {
                    profileText = profileText + await pdfToText(req.body.resume);
                }
                if (req.body.areasOfInterest) {
                    const interestsString = req.body.areasOfInterest.join(" ");
                    profileText = profileText + " " + interestsString;
                }
                req.body.vectorEmbedding = await performWord2VecEmbedding(profileText);
            }
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
            let profileCompletionPerc = parseInt(100 - ((emptyFields / totalFields) * 100))
            await Student.updateOne({ userId: user.userId }, { profileCompletionPerc: profileCompletionPerc });
            logger.info(`Student profile ${req.user.userId} updated`,{ userId: req.user.userId })
            res.json({ message: "Updation Successful!" });
        } else {
            logger.error("Student doesn't exist",{userId: req.user.userId})
            res.status(400).json({ error: "Student doesn't exist" });
        }
    } catch (error) {
        logger.error("Error with student profile updation")
        res.status(400).json({ error: `Error : ${error.message}` });
    }
});


router.get("/student_list", isLoggedIn, async(req, res) => {
    const { Student } = req.context.models;
    let query = {};

    // Department Filter
    if (req.query.department) {
        const department = req.query.department;
        query.department = department;
    }

    // Areas of Interest Filter
    if (req.query.areasOfInterest) {
        const areasOfInterest = req.query.areasOfInterest.split(",");

        // Build the $or array for filtering
        const orArray = [];

        // Generate combinations of areasOfInterest and add conditions
        const combinations = generateCombinations(areasOfInterest);
        console.log(combinations)
        combinations.forEach((combination) => {
            orArray.push({ areasOfInterest: { $all: combination } });
        });

        // Add condition for any single areaOfInterest
        orArray.push({ areasOfInterest: { $in: areasOfInterest } });

        query.$or = orArray;
    }


    // // Year of Joining Before Filter
    // if (req.query.yearBefore) {
    //     const yearBefore = parseInt(req.query.yearBefore);
    //     query.yearOfJoining = { $lt: yearBefore };
    // }

    // // Year of Joining After Filter
    // if (req.query.yearAfter) {
    //     const yearAfter = parseInt(req.query.yearAfter);
    //     query.yearOfJoining = { $gt: yearAfter };
    // }

    try {
        let sortOptions = {};

        // Sort by Name A to Z
        if (req.query.sort === "a_to_z") {
            sortOptions = { firstName: 1, lastName: 1, dateJoined: -1, updated: -1 };
        }

        // Sort by Name Z to A
        if (req.query.sort === "z_to_a") {
            sortOptions = { firstName: -1, lastName: -1, dateJoined: -1, updated: -1 };
        }

        // Sort by Latest
        if (req.query.sort === "latest") {
            sortOptions = { dateJoined: -1, firstName: 1, lastName: 1, updated: -1 };
        }

        // Sort by Oldest
        if (req.query.sort === "oldest") {
            sortOptions = { dateJoined: 1, firstName: 1, lastName: 1, updated: 1 };
        }

        const studentList = await Student.find(query)
            .lean()
            .collation({ locale: "en" })
            .sort(sortOptions)
            .catch((error) => {
                console.error(error);
                res.status(400).json({ error });
            });

        res.json(studentList);
    } catch (error) {
        res.status(400).json({ error: `Error : ${error.message}` });
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
        res.status(400).json({ error: `Error : ${error.message}` });
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
            logger.info(`Student profile ${req.user.userId} bookmarked ${req.body.blogId} `,{ userId: req.user.userId })
            // send updated user as response
            res.json({ message: "Bookmarked Blog" });

        } else {

            res.status(400).json({ error: newblogId + " is already Bookmarked!" });
        }
    } catch (error) {
        logger.error("Error with blog bookmarking",{userId: req.user.userId})
        res.status(400).json({ error: `Error : ${error.message}` });
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
        res.status(400).json({ error: `Error : ${error.message}` });
    }
});

module.exports = router;