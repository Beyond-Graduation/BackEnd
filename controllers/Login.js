require("dotenv").config(); // load .env variables
const { Router } = require("express"); // import router from express
const bcrypt = require("bcryptjs"); // import bcrypt to hash passwords
const jwt = require("jsonwebtoken"); // import jwt to sign tokens


const User = require('../models/User');

const router = Router(); // create router to create route bundle

//DESTRUCTURE ENV VARIABLES WITH DEFAULTS
const { SECRET = "secret" } = process.env;



// Login route to verify a user and get a token
// Single Login for all
router.post("/", async (req, res) => {
    
    try {
        const user = await User.findOne({ email: req.body.email });
      // check if the user exists
        if (user) {

            //check if password matches
            const result = await bcrypt.compare(req.body.password, user.password);
            if (result) {
              if(user.__t=="AlumniPending"){
                res.status(400).json({ error: "Pending Verification!" });
              }
            // sign token and send it in response
            const token = await jwt.sign({ userId: user.userId, userType:user.__t }, SECRET);
            res.json({ "token":token, "userId": user.userId, "userType": user.__t });
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


module.exports = router;