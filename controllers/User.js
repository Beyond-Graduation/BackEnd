require("dotenv").config(); // load .env variables
const { Router } = require("express"); // import router from express
const nodemailer = require("nodemailer"); // import nodemailer to send emails
const bcrypt = require("bcryptjs"); // import bcrypt to hash passwords
const jwt = require("jsonwebtoken"); // import jwt to sign tokens
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
// const User = require("../models/User");
const cosineSimilarity = require('cosine-similarity');
const router = Router(); // create router to create route bundle
const logger = require("../logging/logger")
//DESTRUCTURE ENV VARIABLES WITH DEFAULTS
const { SECRET = "secret" } = process.env;
const { FRONTEND_HOST_LINK } = process.env;
// Login route to verify a user and get a token
// Single Login for all
router.post("/login", async(req, res) => {
    const { User } = req.context.models;
    try {
        const user = await User.findOne({ email: req.body.email });
        console.log(user);
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
                logger.info(`${user.__t} ${user.userId} logged in`,{ userId: user.userId })
                res.json({ token: token, userId: user.userId, userType: user.__t });
            } else {
                logger.error("password doesn't match",{ userId: user.userId })
                res.status(400).json({ error: "Incorrect Password" });
            }
        } else {
            logger.error("User doesn't exist",{ userId: user.userId })
            res.status(400).json({ error: "User doesn't exist" });
        }
    } catch (error) {
        logger.error("Login failed")
        res.status(400).json({ error: `Error : ${error.message}` });
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

            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.MAIL_ID,
                    pass: process.env.MAIL_PASSWORD,
                },
            });
            const options = {
                from: process.env.MAIL_ID,
                to: user.email,
                subject: "BeGrad : Your password has been successfully Updated!",
                text: "Hi, \nYour password has been successfully updated. Incase this was not an update from your side, do change the password as soon as possible using Forgot password option to ensure security.\n\nRegards,\nBeyond Graduation,\nCETAA",
            };
            transporter.sendMail(options, function(err, info) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Sent :" + info.response);
            });
            logger.info('Password Change Sucessful',{ userId: user.userId })
            res.json({ message: "Password Changed Successfully" });
        } else {
            logger.error('Incorrect Password',{ userId: user.userId })
            res.status(400).send("Incorrect Password");
        }
    } catch (error) {
        logger.error('Error in password change',{ userId: user.userId })
        res.status(400).json({ error: `Error : ${error.message}` });
    }
});

// forgot password request

// declare all characters
const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateString(length) {
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

// To send a mail with a reset link of the form https://localhost:4000/reset_password/uniqueGeneratedToken
router.post("/forgot_password", async(req, res) => {
    const { User } = req.context.models;
    let user = await User.findOne({ email: req.body.email }).lean();
    if (user) {
        const passwordResetToken = generateString(15);
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.MAIL_ID,
                pass: process.env.MAIL_PASSWORD,
            },
        });
        const options = {
            from: process.env.MAIL_ID,
            to: req.body.email,
            subject: "BeGrad : Password Reset Link!",
            text: "Hi, \nFollowing your request to reset password to login, we have generated a unique password reset link below:\n" +
                FRONTEND_HOST_LINK + "/reset_password/" +
                passwordResetToken +
                "  \nKindly click on the link quickly to reset your password.\n\nRegards,\nBeyond Graduation,\nCETAA",
        };
        transporter.sendMail(options, function(err, info) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Sent :" + info.response);
        });
        req.body.updated = Date.now();
        await User.updateOne({ email: req.body.email }, { passwordResetToken: passwordResetToken, updated: req.body.updated });
        user = await User.findOne({ email: req.body.email }).lean();
        logger.info('Requested for forgot password',{ userId: user.userId })
        res.json(user);
    } else {
        logger.error("User with this email doesn't exist!",{ userId: user.userId })
        res.status(400).send("User with this email doesn't exist!");
    }
});

// // resetting password as it was forgot :)
router.post("/reset_password", async(req, res) => {
    const { User } = req.context.models;
    let user = await User.findOne({
        passwordResetToken: req.body.passwordResetToken,
    }).lean();
    if (user) {
        req.body.updated = Date.now();
        req.body.newPassword = await bcrypt.hash(req.body.newPassword, 10);
        await User.updateOne({ passwordResetToken: req.body.passwordResetToken }, { password: req.body.newPassword, updated: req.body.updated });
        user = await User.findOne({
            passwordResetToken: req.body.passwordResetToken,
        }).lean();

        // Resetting the passwordResetToken to default "000000000000000"
        // to avoid duplicate password resets
        await User.updateOne({ userId: user.userId }, { passwordResetToken: "000000000000000" });

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.MAIL_ID,
                pass: process.env.MAIL_PASSWORD,
            },
        });
        const options = {
            from: process.env.MAIL_ID,
            to: user.email,
            subject: "BeGrad : Your password has been reset!",
            text: "Hi, \nYour password has been successfully reset following your request. Log in back to the website to continue.\n\nRegards,\nBeyond Graduation,\nCETAA",
        };
        transporter.sendMail(options, function(err, info) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Sent :" + info.response);
        });
        logger.info('Reset Password successful',{ userId: user.userId })
        res.json({ message: "Password Reset Successfully" });
    } else {
        logger.error('Failed password reset due to invalid link')
        res
            .status(400)
            .send(
                "Invalid Password Reset link!, Kindly proceed to forgot password again for a new link"
            );
    }
});

router.get("/getDetails/:userId", isLoggedIn, async(req, res) => {
    const { User } = req.context.models;
    if (req.params.userId) {
        var curUserId = req.params.userId;
        res.json(
            await User.findOne({ userId: curUserId }).lean().catch((error) =>
                res.status(400).json({ error })
            )
        );
    }
});

router.get('/get_interest_list', isLoggedIn, async(req, res) => {
    const { User } = req.context.models;
    try {
        const areasOfInterest = await User.distinct('areasOfInterest');
        res.json({ areasOfInterest });
    } catch (error) {
        res.status(400).json({ error: `Error : ${error.message}` });
    }
});


router.get('/get_similar_profiles', isLoggedIn, async(req, res) => {
    const { User } = req.context.models;
    const { Student } = req.context.models;
    const { Alumni } = req.context.models;
    const curUserId = req.user.userId;
    try {
        const curUserId = req.user.userId;
        const currentUser = await User.findOne({ userId: curUserId }).select('vectorEmbedding resume');
        if (currentUser.resume) {
            if (!currentUser) {
                throw new Error('Current user not found');
            }

            const students = await Student.find({ userId: { $ne: curUserId }, vectorEmbedding: { $ne: null } }).select('userId firstName lastName profilePicPath department expectedGraduationYear areasOfInterest vectorEmbedding');

            // Calculate cosine similarity for all students
            const student_similarities = students.map(student => ({
                userId: student.userId,
                firstName: student.firstName,
                lastName: student.lastName,
                profilePicPath: student.profilePicPath,
                department: student.department,
                expectedGraduationYear: student.expectedGraduationYear,
                areasOfInterest: student.areasOfInterest,
                similarity: cosineSimilarity(currentUser.vectorEmbedding, student.vectorEmbedding)
            }));

            // Sort the students based on similarity in descending order
            student_similarities.sort((a, b) => b.similarity - a.similarity);

            // Get the top 5 most similar students
            const similar_students = student_similarities.slice(0, 5);

            const alumnis = await Alumni.find({ userId: { $ne: curUserId }, vectorEmbedding: { $ne: null } }).select('userId firstName lastName profilePicPath department yearGraduation areasOfInterest vectorEmbedding');

            // Calculate cosine similarity for all alumni
            const alumni_similarities = alumnis.map(alumni => ({
                userId: alumni.userId,
                firstName: alumni.firstName,
                lastName: alumni.lastName,
                profilePicPath: alumni.profilePicPath,
                department: alumni.department,
                yearGraduation: alumni.yearGraduation,
                areasOfInterest: alumni.areasOfInterest,
                similarity: cosineSimilarity(currentUser.vectorEmbedding, alumni.vectorEmbedding)
            }));

            // Sort the alumni based on similarity in descending order
            alumni_similarities.sort((a, b) => b.similarity - a.similarity);

            // Get the top 5 most similar alumni
            const similar_alumni = alumni_similarities.slice(0, 5);

            res.json({
                similar_students: similar_students,
                similar_alumni: similar_alumni
            });
        } else {
            res.status(200).json({ message: "Current user doesn't have resume" });
        }
    } catch (error) {
        res.status(400).json({ error: `Error : ${error.message}` });
    }
});




module.exports = router;