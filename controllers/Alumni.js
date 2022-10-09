require("dotenv").config(); // load .env variables
const { Router } = require("express"); // import router from express
const bcrypt = require("bcryptjs"); // import bcrypt to hash passwords
const jwt = require("jsonwebtoken"); // import jwt to sign tokens
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware

const router = Router(); // create router to create route bundle

//DESTRUCTURE ENV VARIABLES WITH DEFAULTS
const { SECRET = "secret" } = process.env;


// Department Wise Filtering included
// http://localhost:4000/alumni/alumni_list?department=CSE
router.get("/alumni_list", isLoggedIn, async (req, res) => {
  const { Alumni } = req.context.models;
  if(req.query.department){
    var dept  = req.query.department
    console.log("Department:",dept)
    res.json(
      await Alumni.find({department : dept}).catch((error) =>
        res.status(400).json({ error })
      )
    );
  }
  else{
    res.json(
      await Alumni.find().catch((error) =>
        res.status(400).json({ error })
      )
    );
  }
});


router.get("/alumni_details", isLoggedIn, async (req, res) => {
  const { Alumni } = req.context.models;
  if(req.query.userId){
    var curUserId  = req.query.userId
    console.log(req.query.userId)
    console.log("User Id:",curUserId)
    res.json(
      await Alumni.findOne({userId:curUserId}).catch((error) =>
        res.status(400).json({ error })
      )
    );
  }

});



router.post("/filter",isLoggedIn,async(req,res)=>{
  const { Alumni }= req.context.models;
  var query = {}
  if(req.body.department){
    query.department=req.body.department
  }
  if(req.body.areasOfInterest){
    query.areasOfInterest={ $all: req.body.areasOfInterest}
  }
  if(req.body.before && req.body.after){
    query.yearGraduation={ $gte: req.body.after, $lte: req.body.before }
  }
  else if(req.body.after){
    query.yearGraduation={ $gte: req.body.after}
  }
  else if(req.body.before){
    query.yearGraduation={ $lte: req.body.before}
  }
  console.log("QUERY :",query)
  res.json(
    await Alumni.find(query).catch((error) =>
      res.status(400).json({ error })
    )
  );
  
})




// Signup route to create a new user
router.post("/signup", async (req, res) => {
  const { AlumniPending } = req.context.models;
  try {
    // hash the password
    req.body.password = await bcrypt.hash(req.body.password, 10);
    // create a new user
    const user = await AlumniPending.create(req.body);
    // send new user as response
    res.json(user);
  } catch (error) {
    res.status(400).json({ error });
  }
});




// Update route to update details
router.post("/update", isLoggedIn, async (req, res) => {
  const curUserId  = req.user.userId;
  const { Alumni } = req.context.models;
  
  try {
    // check if the user exists
    const user = await Alumni.findOne({userId: curUserId  });
    req.body.updated = Date.now()
    if (user) {
      //check if password matches
      await Alumni.updateOne({userId: curUserId  }, req.body);
      // send updated user as response
      const user = await Alumni.findOne({userId: curUserId  });
      res.json(user);
    } else {
      res.status(400).json({ error: "Alumni doesn't exist" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});


// For Developer only
router.post("/delete", async (req, res) => {
  try {
    const curUserId  = req.body.userId;
    const confirm = req.body.isDelete
    if (confirm){
      const { Alumni } = req.context.models;
      const { Blog } = req.context.models;
      await Blog.remove({userId: curUserId  });
      await Alumni.remove({userId: curUserId  });
      res.send("Deleted Successfully");
    }
    else{
      res.send("Verify CONFIRM key")
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});



module.exports = router;