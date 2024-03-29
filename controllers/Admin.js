require("dotenv").config(); // load .env variables
const nodemailer = require('nodemailer'); // import nodemailer to send emails
const { Router } = require("express"); // import router from express
const bcrypt = require("bcryptjs"); // import bcrypt to hash passwords
const jwt = require("jsonwebtoken"); // import jwt to sign tokens
const { isAdminLoggedIn } = require("./middleware");
const router = Router(); // create router to create route bundle
const { performWord2VecEmbedding } = require("../functions/textEmbedding.js");
const { pdfToText } = require("../functions/textEmbedding.js");
const { htmlToText } = require('html-to-text');
const logger = require("../logging/logger")

// Signup route to create a new user
router.post("/signup", async(req, res) => {
    const { Admin } = req.context.models;
    const { User } = req.context.models;
    try {
        var alreadyExists = await User.findOne({ email: req.body.email }).lean();
        if (alreadyExists) {
            return res.status(400).send({
                message: 'An account already exists with this email ID! Kindly Log In if you have already registered.'
            });

        } else {
            // hash the password
            req.body.password = await bcrypt.hash(req.body.password, 10);
            req.body.updated = Date.now();
            req.body.likedBlogs = []
                // create a new user
            await Admin.create(req.body);
            // send new user as response
            logger.info(`Admin profile ${req.body.userId} registered`, { userId: req.body.userId })
            res.json({ message: "Admin Profile Created, Pending Approval" });
        }
    } catch (error) {
        logger.error('Error with admin profile registration')
        res.status(400).json({ error: `Error : ${error.message}` });
    }
});


router.get("/pending_alumni_list", isAdminLoggedIn, async(req, res) => {
    const { AlumniPending } = req.context.models;
    if (req.query.department) {
        var dept = req.query.department
        res.json(
            await AlumniPending.find({ department: dept }).lean().sort({ dateJoined: -1 }).catch((error) =>
                res.status(400).json({ error })
            )
        );
    } else {
        res.json(
            await AlumniPending.find().lean().sort({ dateJoined: -1 }).catch((error) =>
                res.status(400).json({ error })
            )
        );
    }
});


router.post("/alumni_approve", isAdminLoggedIn, async(req, res) => {
    const { AlumniPending } = req.context.models;
    var query = {}
    if (req.body.userId) {
        curUserId = req.body.userId
        let user = await AlumniPending.findOne({ userId: curUserId }).lean();

        if (user) {

            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.MAIL_ID,
                    pass: process.env.MAIL_PASSWORD
                }
            });
            if (req.body.approved == 0) {
                if (req.body.remarks && req.body.remarks.length > 10) {
                    const options = {
                        from: process.env.MAIL_ID,
                        to: user.email,
                        subject: "Your Profile Registration application has been rejected!",
                        text: "Hi " + user.firstName + ",\nYour Profile Registration application has been rejected as we couldn't verify your profile.\nRemarks:" + req.body.remarks + "\nKindly re-register or contact us for solving the issue if you are an Alumni of CET.\n\nRegards,\nBeyond Graduation,\nCETAA"
                    }
                    transporter.sendMail(options, function(err, info) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        console.log("Sent :" + info.response)
                    })
                    await AlumniPending.remove({ userId: curUserId });
                    res.send("User registration request rejected for " + user.firstName + ".");
                    logger.info(`Alumni profile ${req.body.userId} rejected by admin`, { userId: req.user.userId })
                    return;
                } else {
                    res.send("Kindly add remarks of more than 10 characters to reject a User");
                }
            } else {
                const { Alumni } = req.context.models;
                delete user._id;
                delete user.__t;
                await AlumniPending.remove({ userId: curUserId });
                updatedUser = await Alumni.create(user);

                const options = {
                    from: process.env.MAIL_ID,
                    to: updatedUser.email,
                    subject: "Your Alumni Profile has been Verified",
                    text: "Hi " + updatedUser.firstName + ",\nThanks for registering to Beyond Grad! We have officially verified you as an Alumni and are looking forward to your valuable contribution. Kindly go ahead and login :)\n\nRegards,\nBeyond Graduation,\nCETAA"

                }
                transporter.sendMail(options, function(err, info) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log("Sent :" + info.response)
                })
                logger.info(`Alumni ${req.body.userId} approved by admin`, { userId: req.user.userId })
                res.json({ message: "Approved User as Alumni" });
            }

        } else {
            logger.error("Error with alumni verification by admin")
            res.status(400).json({ error: req.body.userId + " is not a pending alumni" });
        }

    }
});




router.get("/admin_details", isAdminLoggedIn, async(req, res) => {
    const { Admin } = req.context.models;

    if (req.query.userId) {
        var curUserId = req.query.userId
        console.log("User Id:", curUserId)
        res.json(
            await Admin.findOne({ userId: curUserId }).catch((error) =>
                res.status(400).json({ error })
            )
        );
    }
});

router.post("/notice_approve", isAdminLoggedIn, async(req, res) => {
    const { NoticePending } = req.context.models;
    var query = {}
    if (req.body.noticeId) {
        curNoticeId = req.body.noticeId
        let notice = await NoticePending.findOne({ noticeId: curNoticeId }).lean();
        const { Alumni } = req.context.models;
        var alumniDetails = await Alumni.findOne({ userId: notice.userId }).lean();
        if (notice) {
            const { Notice } = req.context.models;
            delete notice._id;
            await NoticePending.remove({ noticeId: curNoticeId });
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.MAIL_ID,
                    pass: process.env.MAIL_PASSWORD
                }
            });
            if (req.body.approved == 0) {
                const options = {
                    from: process.env.MAIL_ID,
                    to: alumniDetails.email,
                    subject: "Your Notice has been Rejected",
                    text: "Hi " + alumniDetails.firstName + ",\n Sorry to inform that your Notice titled " + notice.title + " has been Rejected. Kindly Contact the admin to know more.\n\nRegards,\nBeyond Graduation,\nCETAA"

                }
                transporter.sendMail(options, function(err, info) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log("Sent :" + info.response)
                })
                res.send("Notice request rejected for " + alumniDetails.firstName + ".");
                logger.info(`Notice ${req.body.noticeId} rejected by admin`, { userId: req.user.userId })
                return;
            } else {
                var updatedNotice = await Notice.create(notice);
                const options = {
                    from: process.env.MAIL_ID,
                    to: alumniDetails.email,
                    subject: "Your Notice has been Approved",
                    text: "Hi " + alumniDetails.firstName + ",\n Your notice titled " + notice.title + " has been Approved. Thanks for your contribution :)\n\nRegards,\nBeyond Graduation,\nCETAA"

                }
                transporter.sendMail(options, function(err, info) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log("Sent :" + info.response)
                })
                res.send("Notice request approved for " + alumniDetails.firstName + ".");
                logger.info(`Notice ${req.body.noticeId} approved by admin`, { userId: req.user.userId })
                return;
            }

        }
        res.json({ message: "Notice Approved" });
    }
});

router.get("/pending_notice_list", isAdminLoggedIn, async(req, res) => {
    const { NoticePending } = req.context.models;
    res.json(
        await NoticePending.find().lean().sort({ dateUploaded: -1, title: 1 }).catch((error) =>
            res.status(400).json({ error })
        )
    );
});




router.get("/stats", isAdminLoggedIn, async(req, res) => {


    var counts = {};
    counts.Admin = await (req.context.models.Admin).countDocuments({});
    counts.Alumni = await (req.context.models.Alumni).countDocuments({});
    counts.AlumniPending = await (req.context.models.AlumniPending).countDocuments({});
    counts.Student = await (req.context.models.Student).countDocuments({});
    counts.Blog = await (req.context.models.Blog).countDocuments({});
    counts.Notice = await (req.context.models.Notice).countDocuments({});
    counts.NoticePending = await (req.context.models.NoticePending).countDocuments({});
    counts.BlogComments = await (req.context.models.BlogComments).countDocuments({});
    res.json(counts);

});




router.post("/dbrepair", isAdminLoggedIn, async(req, res) => {
    try {
        const { Alumni } = req.context.models;
        const { AlumniPending } = req.context.models;
        const { Student } = req.context.models;

        let alumniRecords = await Alumni.find({});
        let updatePromises = [];

        for (const alumniRecord of alumniRecords) {
            let vectorEmbedding;
            if (alumniRecord.resume) {
                let profileText = await pdfToText(alumniRecord.resume);
                if (alumniRecord.areasOfInterest) {
                    const interestsString = alumniRecord.areasOfInterest.join(" ");
                    profileText = profileText + " " + interestsString;
                }

                vectorEmbedding = await performWord2VecEmbedding(profileText);
            } else {
                console.log("{userId:", alumniRecord.userId, "}");
            }
            await Alumni.updateOne({ userId: alumniRecord.userId }, { $set: { vectorEmbedding: vectorEmbedding } });
        }

        console.log("All alumni records updated successfully.");


        alumniRecords = await AlumniPending.find({});
        updatePromises = [];

        for (const alumniRecord of alumniRecords) {
            let vectorEmbedding;
            if (alumniRecord.resume) {
                let profileText = await pdfToText(alumniRecord.resume);
                if (alumniRecord.areasOfInterest) {
                    const interestsString = alumniRecord.areasOfInterest.join(" ");
                    profileText = profileText + " " + interestsString;
                }

                vectorEmbedding = await performWord2VecEmbedding(profileText);
            } else {
                console.log("{userId:", alumniRecord.userId, "}");
            }
            await AlumniPending.updateOne({ userId: alumniRecord.userId }, { $set: { vectorEmbedding: vectorEmbedding } });
        }
        console.log("All alumni pending records updated successfully.");


        alumniRecords = await Student.find({});
        updatePromises = [];

        for (const alumniRecord of alumniRecords) {
            let vectorEmbedding;
            if (alumniRecord.resume) {
                let profileText = await pdfToText(alumniRecord.resume);
                if (alumniRecord.areasOfInterest) {
                    const interestsString = alumniRecord.areasOfInterest.join(" ");
                    profileText = profileText + " " + interestsString;
                }

                vectorEmbedding = await performWord2VecEmbedding(profileText);
            } else {
                console.log("{userId:", alumniRecord.userId, "}");
            }
            await Student.updateOne({ userId: alumniRecord.userId }, { $set: { vectorEmbedding: vectorEmbedding } });
        }
        console.log("All student records updated successfully.");
        res.json({ message: "Updated All" })
    } catch (error) {
        console.error(error);
        res.status(400);
    }
});



router.post("/alumni_broadcast", isAdminLoggedIn, async(req, res) => {
    const { Alumni } = req.context.models;
    try {
        const alumnis = await Alumni.find({}, 'email').lean();
        const alumniEmails = alumnis.map(alumni => alumni.email);
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.MAIL_ID,
                pass: process.env.MAIL_PASSWORD
            }
        });
        const options = {
            from: process.env.MAIL_ID,
            to: alumniEmails,
            subject: req.body.subject,
            text: htmlToText(req.body.content),
            html: req.body.content
        }
        transporter.sendMail(options, function(err, info) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Broadcasted emails to alumni:" + info.messageId)
        })
        res.json({ message: "Broadcasted" })
    } catch (error) {
        console.error(error);
        res.status(400);
    }
});

module.exports = router;