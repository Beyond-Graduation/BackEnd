require("dotenv").config(); // load .env variables
const { Router } = require("express"); // import router from express
const bcrypt = require("bcryptjs"); // import bcrypt to hash passwords
const jwt = require("jsonwebtoken"); // import jwt to sign tokens
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
const { isAdminLoggedIn } = require("./middleware");

const router = Router(); // create router to create route bundle

//DESTRUCTURE ENV VARIABLES WITH DEFAULTS
const { SECRET = "secret" } = process.env;



router.get("/pending_alumni_list", isAdminLoggedIn, async (req, res) => {
    const { AlumniPending } = req.context.models;
    if(req.query.department){
      var dept  = req.query.department
      console.log("Department:",dept)
      res.json(
        await AlumniPending.find({department : dept}).catch((error) =>
          res.status(400).json({ error })
        )
      );
    }
    else{
      res.json(
        await AlumniPending.find().catch((error) =>
          res.status(400).json({ error })
        )
      );
    }
  });


router.post("/approve",isAdminLoggedIn,async(req,res)=>{
  const { AlumniPending }= req.context.models;
  var query = {}
  if(req.body.userId){
    curUserId = req.body.userId
    let user = await AlumniPending.findOne({userId: curUserId  });
    
    if(user){
        user = user.toObject();
        console.log(user)
        const { Alumni }= req.context.models;
        delete user._id;
        delete user.__t;
        
        if(user){
            
            await AlumniPending.remove({userId: curUserId  });
        }
        updatedUser = await Alumni.create(user);
        res.json(updatedUser);
    }
    else{
      res.status(400).json({ error: req.body.userId + " is not a pending alumni" });
    }
    
  }
  
})


// Signup route to create a new user
router.post("/signup", async (req, res) => {
    const { Admin } = req.context.models;
    try {
      // hash the password
      req.body.password = await bcrypt.hash(req.body.password, 10);
      // create a new user
      const user = await Admin.create(req.body);
      // send new user as response
      res.json(user);
    } catch (error) {
      res.status(400).json({ error });
    }
  });



router.get("/admin_details", isAdminLoggedIn, async (req, res) => {
  const { Admin } = req.context.models;

  if(req.query.userId){
    var curUserId  = req.query.userId
    console.log("User Id:",curUserId)
    res.json(
      await Admin.findOne({userId:curUserId}).catch((error) =>
        res.status(400).json({ error })
      )
    );
  }

});  

router.post("/dbrepair", isAdminLoggedIn,async (req, res) => {
  const { AlumniPending } = req.context.models;
  res.json(
    await AlumniPending.updateMany({},{gender:"Male"}).catch((error) =>
      res.status(400).json({ error })
    )
  );

});

module.exports = router;