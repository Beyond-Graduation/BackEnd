require("dotenv").config(); // load .env variables
const { Router } = require("express"); // import router from express
const bcrypt = require("bcryptjs"); // import bcrypt to hash passwords
const jwt = require("jsonwebtoken"); // import jwt to sign tokens
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware


const router = Router(); // create router to create route bundle

//DESTRUCTURE ENV VARIABLES WITH DEFAULTS
const { SECRET = "secret" } = process.env;

router.get("/student_list", isLoggedIn, async (req, res) => {
  const { Student } = req.context.models;
  if(req.query.department){
    var dept  = req.query.department
    console.log("Department:",dept)
    res.json(
      await Student.find({department : dept}).catch((error) =>
        res.status(400).json({ error })
      )
    );
  }
  else{
    res.json(
      await Student.find().catch((error) =>
        res.status(400).json({ error })
      )
    );
  }
});


router.get("/student_details", isLoggedIn, async (req, res) => {
  const { Student } = req.context.models;
  if(req.query.userId){
    var curUserId  = req.query.userId
    console.log("User Id:",curUserId)
    res.json(
      await Student.findOne({userId:curUserId}).catch((error) =>
        res.status(400).json({ error })
      )
    );
  }

});



// Signup route to create a new user
router.post("/signup", async (req, res) => {
  const { Student } = req.context.models;
  
  try {
    // hash the password
    req.body.password = await bcrypt.hash(req.body.password, 10);
    
    // create a new user
    const user = await Student.create(req.body);
    // send new user as response
    res.json(user);
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Login route to verify a user and get a token
router.post("/update", isLoggedIn, async (req, res) => {
  const curUserId  = req.user.userId;
  const { Student } = req.context.models;
  try {
    // check if the user exists
    const user = await Student.findOne({userId: curUserId  });
    req.body.updated = Date.now()
    if (user) {
      //check if password matches
      await Student.updateOne({ userId: curUserId  }, req.body);
      // send updated user as response
      const user = await Student.findOne({ userId: curUserId });
      res.json(user);
    } else {
      res.status(400).json({ error: "Student doesn't exist" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;