const { Router } = require("express"); // import Router from express
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
const { isAlumniLoggedIn } = require("./middleware"); // import isAlumniLoggedIn custom middleware
const { isStudentLoggedIn } = require("./middleware"); // import isStudentLoggedIn custom middleware


const router = Router();

// generate internshipId
// get everything except alumniId,FirstName, Last Name, Status, DateUploaded
// description is HTML
router.post("/create", isAlumniLoggedIn, async(req, res) => {
    const { Internship } = req.context.models;
    const { Alumni } = req.context.models;
    const curUserId = req.user.userId;
    const user = await Alumni.findOne({ userId: curUserId }).lean(); // get username from req.user property created by isLoggedIn middleware
    req.body.alumniId = curUserId; // add userId property to req.body
    req.body.firstName = user.firstName;
    req.body.lastName = user.lastName;
    req.body.status = "open";
    req.body.dateUploaded = Date.now();
    // pick email from front end

    res.json(
        await Internship.create(req.body).catch((error) =>
            res.status(400).json({ error })
        )
    );
});

//view all internships and individual internship with req.query.internshipId
router.get("/view_internships", isLoggedIn, async(req, res) => {
    const { Internship } = req.context.models;
    const { Application } = req.context.models;
    if (req.query.internshipId) {
        var internship = await Internship.findOne({
                internshipId: req.query.internshipId,
            })
            .lean()
            .catch((error) => res.status(400).json({ error }));
        internship.userType = req.user.userType
        if (req.user.userType == "Student") {
            let appliedOrNot = await Application.findOne({
                internshipId: req.query.internshipId,
                studentId: req.user.userId
            }).lean();
            internship.applied = appliedOrNot ? "applied" : "not applied";
        }
        res.json(internship);
    } else {
        let internships = await Internship.find()
            .lean()
            .sort({ dateUploaded: -1 })
            .catch((error) => res.status(400).json({ error }));



        const internshipPromises = internships.map(async(internship) => {
            internship.userType = req.user.userType;

            if (req.user.userType === "Student") {
                const appliedOrNot = await Application.findOne({
                    internshipId: internship.internshipId,
                    studentId: req.user.userId,
                }).lean();

                internship.applied = appliedOrNot ? "applied" : "not applied";
            }

            return internship;
        });

        internships = await Promise.all(internshipPromises);



        res.json(internships);
    }
});

//view all internships and individual internship with req.query.internshipId
router.get("/my_internships", isAlumniLoggedIn, async(req, res) => {
    const { Internship } = req.context.models;
    const curUserId = req.user.userId;
    const internships = await Internship.find({ alumniId: curUserId })
        .lean()
        .sort({ dateUploaded: -1 })
        .catch((error) => res.status(400).json({ error }));
    res.json(internships);
});

// close the opportunity
router.post("/close", isAlumniLoggedIn, async(req, res) => {
    const { Internship } = req.context.models;
    const curUserId = req.user.userId;
    try {
        var internship = await Internship.findOne({
            internshipId: req.body.internshipId,
        }).lean();
        req.body.dateModified = Date.now();
        if (internship && internship.alumniId == curUserId) {
            internship = await Internship.updateOne({ internshipId: req.body.internshipId }, // filter criteria
                { $set: { status: "closed" } } // update operation
            );
            //console.log(internship);
            res.json(internship);
        } else {
            res.status(400).json({
                error: "Internship doesn't exist or is not published by the Current user ",
            });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});

// withdraw the opportunity
router.post("/withdraw", isAlumniLoggedIn, async(req, res) => {
    const { Internship } = req.context.models;
    const curUserId = req.user.userId;
    try {
        var internship = await Internship.findOne({
            internshipId: req.body.internshipId,
        }).lean();
        req.body.dateModified = Date.now();
        if (internship && internship.alumniId == curUserId) {
            internship = await Internship.updateOne({ internshipId: req.body.internshipId }, // filter criteria
                { $set: { status: "withdrawn" } } // update operation
            );
            //console.log(internship);
            res.json(internship);
        } else {
            res.status(400).json({
                error: "Internship doesn't exist or is not published by the Current user ",
            });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});

// edit the opportunity posted
router.post("/update", isAlumniLoggedIn, async(req, res) => {
    const curUserId = req.user.userId;
    const { Internship } = req.context.models;
    try {
        // check if the user exists
        var internship = await Internship.findOne({
            internshipId: req.body.internshipId,
        }).lean();
        req.body.dateModified = Date.now();

        if (internship && internship.alumniId == curUserId) {
            internship = await Internship.updateOne({ internshipId: req.body.internshipId },
                req.body
            );
            console.log(internship);
            res.json(internship);
        } else {
            res.status(400).json({
                error: "Internship doesn't exist or is not published by the Current user ",
            });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});

// generate applicationId
// internshpId must be in the body
router.post("/apply", isStudentLoggedIn, async(req, res) => {
    const { Application } = req.context.models;
    const { Internship } = req.context.models;
    const { User } = req.context.models;
    const curUserId = req.user.userId;
    const user = await User.findOne({ userId: curUserId }).lean(); // get username from req.user property created by isLoggedIn middleware
    req.body.studentId = curUserId; // add userId property to req.body
    req.body.firstName = user.firstName;
    req.body.lastName = user.lastName;
    req.body.status = "applied";
    req.body.degree = user.degree;
    req.body.branch = user.department;
    req.body.expectedGraduationYear = user.expectedGraduationYear;
    req.body.resume = user.resume;
    req.body.dateApplied = Date.now();

    var internship = await Internship.findOne({
        internshipId: req.body.internshipId,
    }).lean();

    if (internship.status == "open") {
        req.body.alumniId = internship.alumniId;
        // pick email,phone number, cgpa from front end
        try {
            res.json(await Application.create(req.body));
        } catch (error) {
            res.status(400).json({ error });
        }
    } else {
        res.status(400).send("Opportunity is Closed, Can't accept applications!");
    }

});

// get a students applications [3 options]
// 1. /my_application_view --> All applications by student [in a sorted manner]
// 2. /my_application_view?applicationId=application123 --> A specific application
// 3. /my_application_view?filter=applied  [selected/applied/rejected] --> Applications of particular status
router.get(
    "/my_application_view",
    isStudentLoggedIn,
    async(req, res) => {
        const { Application } = req.context.models;
        curUserId = req.user.userId;
        // filter must be one of ["applied", "rejected", "selected"]
        if (req.query.applicationId) {
            if (req.user.userType == "Student") {
                res.json(
                    // likes:-1 => descending , dateUploaded:-1 ==> latest
                    await Application.findOne({
                        applicationId: req.query.applicationId,
                        studentId: curUserId,
                    })
                    .lean()
                    .catch((error) => res.status(400).json({ error }))
                );
            }
        } else if (req.query.filter) {
            res.json(
                // likes:-1 => descending , dateUploaded:-1 ==> latest
                await Application.find({
                    studentId: curUserId,
                    status: req.query.filter,
                })
                .lean()
                .collation({ locale: "en" })
                .sort({ dateApplied: -1 })
                .catch((error) => res.status(400).json({ error }))
            );
        }
        // view all [default]
        else {
            res.json(
                Application.aggregate([
                    // match documents with the desired userId
                    { $match: { studentId: req.query.studentId } },

                    // sort documents by status and dateOfApplication
                    { $sort: { status: -1, dateApplied: -1 } },

                    // group documents by status
                    {
                        $group: {
                            _id: "$status",
                            applications: { $push: "$$ROOT" },
                        },
                    },

                    // sort groups by status in the order of "selected", "applied", and "rejected"
                    {
                        $sort: {
                            _id: {
                                $switch: {
                                    branches: [
                                        { case: { $eq: ["$_id", "selected"] }, then: 0 },
                                        { case: { $eq: ["$_id", "applied"] }, then: 1 },
                                        { case: { $eq: ["$_id", "rejected"] }, then: 2 },
                                    ],
                                    default: 3,
                                },
                            },
                        },
                    },
                ]).catch((error) => res.status(400).json({ error }))
            );
        }
    }
);

router.get(
    "/opportunity_specific_applications",
    isAlumniLoggedIn,
    async(req, res) => {
        const { Application } = req.context.models;
        curUserId = req.user.userId;
        // filter must be one of ["applied", "rejected", "selected"]
        if (req.query.internshipId) {
            res.json(
                // likes:-1 => descending , dateUploaded:-1 ==> latest
                await Application.find({
                    internshipId: req.query.internshipId,
                    alumniId: curUserId,
                })
                .lean()
                .collation({ locale: "en" })
                .sort({ dateApplied: -1 })
                .catch((error) => res.status(400).json({ error }))
            );
        } else {
            res.send(
                "call /opportunity_specific_applications?internshipId=zyz123   \n Only the current user[alumni] can access their own published opportunity applications"
            );
        }
    }
);

module.exports = router;