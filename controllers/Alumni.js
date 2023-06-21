require("dotenv").config(); // load .env variables
const { Router } = require("express"); // import router from express
const bcrypt = require("bcryptjs"); // import bcrypt to hash passwords
const jwt = require("jsonwebtoken"); // import jwt to sign tokens
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
const { generateCombinations } = require("../functions/customQueryConstraints.js");
const router = Router(); // create router to create route bundle
const { performWord2VecEmbedding } = require("../functions/textEmbedding.js");
const { pdfToText } = require("../functions/textEmbedding.js");



// Signup route to create a new user
router.post("/signup", async(req, res) => {
    const { AlumniPending } = req.context.models;
    const { Alumni } = req.context.models;
    const { User } = req.context.models;
    try {
        var alreadyExists = await User.findOne({ email: req.body.email }).lean();
        if (alreadyExists) {
            return res.status(400).send({
                message: 'An account already exists with this email ID! Kindly Log In if you have already registered.'
            });

        } else {
            alreadyExists = await Alumni.findOne({ admissionId: req.body.admissionId }).lean();

            if (alreadyExists) {
                return res.status(400).send({
                    message: 'An account already exists with this admission ID ! Kindly recheck and contact CETAA if you think there is a conflict'
                });
            } else {
                alreadyExists = await AlumniPending.findOne({ admissionId: req.body.admissionId }).lean();

                if (alreadyExists) {
                    return res.status(400).send({
                        message: 'An account with this Exact Admission ID is under verification! Kindly recheck and contact CETAA if you think there is a conflict'
                    });
                } else {
                    req.body.password = await bcrypt.hash(req.body.password, 10);
                    req.body.updated = Date.now();
                    req.body.likedBlogs = [];


                    // A profile is described by Resume and Areas Of interest
                    // Getting the Resume Text
                    let profileText = await pdfToText(req.body.resume);
                    if (req.body.areasOfInterest) {
                        const interestsString = req.body.areasOfInterest.join(" ");
                        profileText = profileText + " " + interestsString;
                    }

                    req.body.vectorEmbedding = await performWord2VecEmbedding(profileText);
                    await AlumniPending.create(req.body);
                    var user = await AlumniPending.findOne({ userId: req.body.userId }).lean();
                    const totalFields = 14;
                    var emptyFields = 0;
                    const exclusions = ["bookmarkBlog", "favAlumId", "__v"];
                    for (const key of Object.keys(user)) {
                        if (user[key] || exclusions.includes(key)) {} else {
                            console.log(key);
                            emptyFields++;
                        }
                    }
                    req.body.profileCompletionPerc = parseInt(
                        100 - (emptyFields / totalFields) * 100
                    );
                    await AlumniPending.updateOne({ userId: user.userId }, req.body);

                    res.json({ message: "Registration Successful" });

                }

            }


        }

    } catch (error) {
        res.status(400).json({ error: `Error : ${error.message}` });
    }
});

// Update route to update details
router.post("/update", isLoggedIn, async(req, res) => {
    const curUserId = req.user.userId;
    const { Alumni } = req.context.models;

    try {
        // check if the user exists
        var user = await Alumni.findOne({ userId: curUserId }).lean();
        req.body.updated = Date.now();
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
            await Alumni.updateOne({ userId: curUserId }, req.body);
            var user = await Alumni.findOne({ userId: curUserId }).lean();
            console.log(user);
            const totalFields = 14;
            var emptyFields = 0;
            const exclusions = ["bookmarkBlog", "favAlumId", "__v"];
            for (const key of Object.keys(user)) {
                if (user[key] || exclusions.includes(key)) {} else {
                    emptyFields++;
                }
            }
            let profileCompletionPerc = parseInt(
                100 - (emptyFields / totalFields) * 100
            );
            await Alumni.updateOne({ userId: user.userId }, { profileCompletionPerc: profileCompletionPerc });
            // send updated user as response
            user = await Alumni.findOne({ userId: curUserId });
            res.json({ message: "Updation Successful!" });
        } else {
            res.status(400).json({ error: "Alumni doesn't exist" });
        }
    } catch (error) {
        res.status(400).json({ error: `Error : ${error.message}` });
    }
});

// For Developer only
router.post("/delete", async(req, res) => {
    try {
        const curUserId = req.body.userId;
        const confirm = req.body.isDelete;
        if (confirm) {
            const { Alumni } = req.context.models;
            const { Blog } = req.context.models;
            await Blog.remove({ userId: curUserId });
            await Alumni.remove({ userId: curUserId });
            res.send("Deleted Successfully");
        } else {
            res.send("Verify CONFIRM key");
        }
    } catch (error) {
        res.status(400).json({ error: `Error : ${error.message}` });
    }
});


router.get("/alumni_list", isLoggedIn, async(req, res) => {
    const { Alumni } = req.context.models;
    const query = {};

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

        // Add conditions for all areasOfInterest
        orArray.push({ areasOfInterest: { $all: areasOfInterest } });

        // Generate combinations of areasOfInterest and add conditions
        const combinations = generateCombinations(areasOfInterest);
        combinations.forEach((combination) => {
            orArray.push({ areasOfInterest: { $all: combination } });
        });

        // Add condition for any single areaOfInterest
        orArray.push({ areasOfInterest: { $in: areasOfInterest } });

        query.$or = orArray;
    }


    // Year of Graduation Before Filter
    if (req.query.yearBefore) {
        const yearBefore = parseInt(req.query.yearBefore);
        query.yearGraduation = { $lt: yearBefore };
    }

    // Year of Graduation After Filter
    if (req.query.yearAfter) {
        const yearAfter = parseInt(req.query.yearAfter);
        query.yearGraduation = { $gt: yearAfter };
    }

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

        const alumniList = await Alumni.find(query)
            .lean()
            .collation({ locale: "en" })
            .sort(sortOptions)
            .catch((error) => {
                console.error(error);
                res.status(400).json({ error });
            });

        res.json(alumniList);
    } catch (error) {
        res.status(400).json({ error: `Error : ${error.message}` });
    }
});

router.get("/alumni_details", isLoggedIn, async(req, res) => {
    const userType = req.user.userType;
    const reqUserId = req.user.userId;
    const { Alumni } = req.context.models;
    if (req.query.userId) {
        var curUserId = req.query.userId;
        // console.log(req.query.userId)
        // console.log("User Id:",curUserId);
        var resUser = await Alumni.findOne({ userId: curUserId }).lean().catch((error) =>
            res.status(400).json({ error })
        );
        if (userType === "Student") {
            console.log(userType);
            const { Student } = req.context.models;
            const user = await Student.findOne({ userId: reqUserId });
            if (user.favAlumId.includes(curUserId)) resUser.isFavourite = true;
            else resUser.isFavourite = false;
        }
        res.json(resUser);
    }
});

// Route to add bookmarks
router.post("/bookmark", isLoggedIn, async(req, res) => {
    const curUserId = req.user.userId;
    const newblogId = req.body.blogId;
    const { Alumni } = req.context.models;
    try {
        // check if the user exists
        const user = await Alumni.findOne({ userId: curUserId });
        req.body.updated = Date.now();
        var curBookmarkBlogs = user.bookmarkBlog;

        if (user && curBookmarkBlogs.includes(newblogId) == false) {
            curBookmarkBlogs.push(newblogId);
            console.log(curBookmarkBlogs);
            await Alumni.updateOne({ userId: curUserId }, { bookmarkBlog: curBookmarkBlogs });
            res.json({ message: "Bookmarked the blog" });
        } else {
            res.status(400).json({ error: newblogId + " is already Bookmarked!" });
        }
    } catch (error) {
        res.status(400).json({ error: `Error : ${error.message}` });
    }
});

// Route toget bookmarks
router.get("/bookmarklist", isLoggedIn, async(req, res) => {
    const curUserId = req.user.userId;
    const { Alumni } = req.context.models;
    try {
        // check if the user exists
        const user = await Alumni.findOne({ userId: curUserId });

        if (user) {
            var curBookmarkBlogs = user.bookmarkBlog;
            console.log(curBookmarkBlogs);
            res.json(curBookmarkBlogs);
        } else {
            res.status(400).json({ error: curUserId + " Does Not exist" });
        }
    } catch (error) {
        res.status(400).json({ error: `Error : ${error.message}` });
    }
});

module.exports = router;