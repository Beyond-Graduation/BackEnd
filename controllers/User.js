require("dotenv").config(); // load .env variables
const { Router } = require("express"); // import router from express
const bcrypt = require("bcryptjs"); // import bcrypt to hash passwords
const jwt = require("jsonwebtoken"); // import jwt to sign tokens
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
// const User = require("../models/User");




const router = Router(); // create router to create route bundle

//DESTRUCTURE ENV VARIABLES WITH DEFAULTS
const { SECRET = "secret" } = process.env;

// Login route to verify a user and get a token
// Single Login for all
router.post("/login", async(req, res) => {
    const { User } = req.context.models;
    try {
        const user = await User.findOne({ email: req.body.email });
        console.log(user)
            // check if the user exists
        if (user) {
            //check if password matches
            const result = await bcrypt.compare(req.body.password, user.password);
            if (result) {
                if (user.__t == "AlumniPending") {
                    res.status(400).json({ error: "Institute Verification Pending!" });
                    return;
                }
                // sign token and send it in response
                const token = await jwt.sign({ userId: user.userId, userType: user.__t },
                    SECRET
                );
                res.json({ token: token, userId: user.userId, userType: user.__t });
            } else {
                res.status(400).json({ error: "password doesn't match" });
            }
        } else {
            res.status(400).json({ error: "User doesn't exist" });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});


router.post("/change_password", isLoggedIn, async(req, res) => {
    const { User } = req.context.models;
    const curUserId = req.user.userId;
    var user = await User.findOne({ userId: curUserId }).lean();
    try {
        const result = await bcrypt.compare(req.body.oldPassword, user.password);
        if (result) {
            req.body.newPassword = await bcrypt.hash(req.body.newPassword, 10);
            req.body.updated = Date.now();
            await User.updateOne({ userId: curUserId }, { password: req.body.newPassword, updated: req.body.updated });
            // console.log(user);
            user = await User.findOne({ userId: curUserId }).lean();
            res.json(user);
        } else {
            res.status(400).send("Incorrect Password, Authentication Failed!");
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});

module.exports = router;