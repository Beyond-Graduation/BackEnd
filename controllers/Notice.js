const { Router } = require("express"); // import Router from express
const { isAdminLoggedIn } = require("./middleware"); // import isAdminLoggedIn custom middleware
const { isAlumniLoggedIn } = require("./middleware"); // import isAlumniLoggedIn custom middleware
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware

const router = Router();
const logger = require("../logging/logger");

router.post("/create", isLoggedIn, async(req, res) => {
    if (req.user.userType == "Admin") {
        const { Notice } = req.context.models;
        const { Admin } = req.context.models;
        const curUserId = req.user.userId;
        const user = await Admin.findOne({ userId: curUserId }); // get username from req.user property created by isLoggedIn middleware
        req.body.userId = curUserId; // add userId property to req.body
        req.body.firstName = user.firstName
        req.body.lastName = user.lastName
        await Notice.create(req.body).catch((error) =>
            res.status(400).json({ error })
        );
        logger.info(`Notice ${req.body.noticeId} created by admin`,{ userId: req.user.userId })
        res.json({ message: "Admin Created Notice" });

    } else if (req.user.userType == "Alumni") {
        const { NoticePending } = req.context.models;
        const { Alumni } = req.context.models;
        const curUserId = req.user.userId;
        const user = await Alumni.findOne({ userId: curUserId }); // get username from req.user property created by isLoggedIn middleware
        console.log(user)
        req.body.userId = curUserId; // add userId property to req.body
        req.body.firstName = user.firstName
        req.body.lastName = user.lastName
        await NoticePending.create(req.body).catch((error) =>
            res.status(400).json({ error })
        );
        logger.info(`Notice ${req.body.noticeId} publishing requested by alumni`,{ userId: req.user.userId })
        res.json({ message: "Alumni Created Notice, Approval Pending" });
    } else {
        res.status(400).json({ error: curUserId + " do not have the permission to publish notices. " });
        logger.error('No permission to publish notice')
    }
});

// Index Route with isLoggedIn middleware
router.get("/", isLoggedIn, async(req, res) => {
    const { Notice } = req.context.models;
    if (req.query.noticeId) {
        var curNoticeId = req.query.noticeId
        res.json(
            await Notice.findOne({ noticeId: curNoticeId }).lean().catch((error) =>
                res.status(400).json({ error })
            )
        );
    } else {
        if (req.user.userType == "Student") {
            res.json(
                await Notice.find({ noticeType: "Public" }).lean().collation({ 'locale': 'en' }).sort({ dateUploaded: -1, title: 1 }).catch((error) =>
                    res.status(400).json({ error })
                )
            );
        } else {
            if (req.query.filter == "Alumni") {
                res.json(
                    await Notice.find({ noticeType: "Alumni" }).lean().collation({ 'locale': 'en' }).sort({ dateUploaded: -1, title: 1 }).catch((error) =>
                        res.status(400).json({ error })

                    )
                );
            } else if (req.query.filter == "All") {
                res.json(
                    await Notice.find({ noticeType: { $in: ["Public", "Alumni"] } }).lean().collation({ 'locale': 'en' }).sort({ dateUploaded: -1, title: 1 }).catch((error) =>
                        res.status(400).json({ error })
                    )
                );
            }
        }

    }
});

module.exports = router;