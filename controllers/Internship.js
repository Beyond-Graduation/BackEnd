const { Router } = require("express"); // import Router from express
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
const { isAlumniLoggedIn } = require("./middleware"); // import isAlumniLoggedIn custom middleware
const Internship = require("../models/Internship");

const router = Router();

// create Route with isLoggedIn middleware
router.post("/create", isAlumniLoggedIn, async(req, res) => {
    const { Internship } = req.context.models;
    const { Alumni } = req.context.models;
    const curUserId = req.user.userId;
    const user = await Alumni.findOne({ userId: curUserId }).lean(); // get username from req.user property created by isLoggedIn middleware
    req.body.userId = curUserId; // add userId property to req.body
    req.body.firstName = user.firstName;
    req.body.lastName = user.lastName;
    //create new todo and send it in response
    res.json(
        await Internship.create(req.body).catch((error) =>
            res.status(400).json({ error })
        )
    );
});

//view all internships
router.get("/", isLoggedIn, async(req,res) => {
    const { Internship } = req.context.models;
    const internships = await Internship.find().lean().sort({ dateUploaded: -1 })
        .catch((error) => res.status(400).json({ error }));
    res.json(internships);    
});

//to view the applicants
router.get("/", isAlumniLoggedIn, async(req,res) => {
    const { Internship } = req.context.models;
    const { Application } = req.context.models;
    const curUserId = req.user.userId;
    const curInternshipId = req.query.internshipId;
    try{
        const internships = await Internship.findById(curInternshipId).lean();
        const applications = await Application.find({ internshipId: curInternshipId }).lean();
        if (applications.AlumniId != curUserId) {
            return res.status(403).send('You are not authorized to view this internship');
        }      
        res.json({ internships, applications });
    } catch (error) {
        res.status(400).json({ error });
    }
});

//view a specific internship
router.get("/view/:id", isLoggedIn, async(req, res) => {
    const { Internship } = req.context.models;
    var curInternshipId = req.params.id;
    try{        
        const internship = await Internship.findById({curInternshipId}).lean();
        res.json(internship);
    } catch (error) {
        res.status(400).json({ error });
    }
});

// close the opportunity
router.post("/close", isAlumniLoggedIn, async(req,res) => {
    const { Internship } = req.context.models;
    const { user } = req.context.models;
    const curUserId = req.user.userId;
    try {
        var internship = await Internship.findOne({ internshipId: req.body.internshipId }).lean();
        req.body.dateModified = Date.now();
        if (internship || internship.AlumniId == curUserId) {
            internship = await internship.updateOne(
                { internshipId: req.body.internshipId }, // filter criteria
                { $set: { status: 'closed' } } // update operation
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
        var internship = await Internship.findOne({ internshipId: req.body.internshipId }).lean();
        req.body.dateModified = Date.now();
        if (internship || internship.userId == curUserId) {
            internship = await internship.updateOne({ internshipId: req.body.internshipId }, req.body);
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

module.exports = router;