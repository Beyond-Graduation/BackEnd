const { Router, application } = require("express"); // import Router from express
// const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
// const { isAlumniLoggedIn } = require("./middleware"); // import isAlumniLoggedIn custom middleware
const { isStudentLoggedIn } = require("./middleware"); // import isStudentLoggedIn custom middleware
const Application = require("../models/Application");

const router = Router();

// apply for a internship
router.post("/apply", isStudentLoggedIn, async(req, res) => {
    const { Application } = req.context.models;
    const { Student } = req.context.models;
    const curUserId = req.user.userId;
    const user = await Student.findOne({ userId: curUserId }).lean(); // get username from req.user property created by isLoggedIn middleware
    req.body.userId = curUserId; // add userId property to req.body
    req.body.firstName = user.firstName;
    req.body.lastName = user.lastName;
    //create new todo and send it in response
    res.json(
        await Application.create(req.body).catch((error) =>
            res.status(400).json({ error })
        )
    );
});
 
//view all application
router.get("/", isStudentLoggedIn, async(req,res) => {
    const { Application } = req.context.models;
    const { Student } = req.context.models;
    curUserId = req.user.userId;
    if(Application.studentId == curUserId) {
    const applications = await Application.find(curUserId).lean()
        .catch((error) => res.status(400).json({ error }));
        res.json(applications);   
    }
});

//view a specific application
router.get("/view", isLoggedIn, async(req, res) => {
    const { Application } = req.context.models;
    const { User } = req.context.models;
    if(User.userId = Application.studentId){
        if(req.query.applicationId) {
            var curApplicationId = req.query.applicationId;
            var application = await Application.findOne({applicationId : curApplicationId}).lean()
                .catch((error) => res.status(400).json({ error }));
            res.json(application);
        }
    }
});

module.exports = router;