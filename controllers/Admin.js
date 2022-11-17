require("dotenv").config(); // load .env variables
const nodemailer = require('nodemailer'); // import nodemailer to send emails
const { Router } = require("express"); // import router from express
const bcrypt = require("bcryptjs"); // import bcrypt to hash passwords
const jwt = require("jsonwebtoken"); // import jwt to sign tokens
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
const { isAdminLoggedIn } = require("./middleware");
const AlumniPending = require("../models/AlumniPending");

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


router.post("/alumni_approve",isAdminLoggedIn,async(req,res)=>{
  const { AlumniPending }= req.context.models;
  var query = {}
  if(req.body.userId){
    curUserId = req.body.userId
    let user = await AlumniPending.findOne({userId: curUserId  }).lean();
    
    if(user){
        const { Alumni }= req.context.models;
        delete user._id;
        delete user.__t;
        
        if(user){
            
            await AlumniPending.remove({userId: curUserId  });
        }
        updatedUser = await Alumni.create(user);
        const transporter = nodemailer.createTransport({
          service:"Gmail",
          auth:{
              user:process.env.MAIL_ID,
              pass:process.env.MAIL_PASSWORD
          }
        });
        const options={
          from:process.env.MAIL_ID,
          to:updatedUser.email,
          subject:"Your Alumni Profile Verified",
          text:"Hi "+updatedUser.firstName+",\nThanks for registering to Beyond Grad! We have officially verified you as an Alumni and are looking forward to your valuable contribution. Kindly go ahead and login :)\n\nRegards,\nBeyond Graduation,\nCETAA"
      
      }
      transporter.sendMail(options,function(err,info){
          if(err){
              console.log(err);
              return;
          }
          console.log("Sent :" + info.response)
      })
        
        res.json(updatedUser);
    }
    else{
      res.status(400).json({ error: req.body.userId + " is not a pending alumni" });
    }
    
  }
});


// Signup route to create a new user
router.post("/signup", async (req, res) => {
    const { Admin } = req.context.models;
    try {
      // hash the password
      req.body.password = await bcrypt.hash(req.body.password, 10);
      req.body.updated = Date.now();
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

router.post("/notice_approve",isAdminLoggedIn,async(req,res)=>{
  const { NoticePending }= req.context.models;
  var query = {}
  if(req.body.noticeId){
    curNoticeId = req.body.noticeId
    let notice = await NoticePending.findOne({noticeId: curNoticeId  }).lean();
    // notice = notice.toObject();
    console.log(notice)
    if(notice){
        const { Notice }= req.context.models;
        delete notice._id;
        
        if(notice){
            
            await NoticePending.remove({noticeId: curNoticeId  });
        }
        updatedNotice = await Notice.create(notice);
    }
    res.json(updatedNotice);
  }
});

router.get("/pending_notice_list", isAdminLoggedIn, async (req, res) => {
  const { NoticePending } = req.context.models;
  res.json(
      await NoticePending.find().catch((error) =>
        res.status(400).json({ error })
      )
    );
  });

router.post("/dbrepair", isAdminLoggedIn,async (req, res) => {
  const { Blog } = req.context.models;
  res.json(
      await Blog.updateMany({},{dateUploaded:Date.now(),dateModified:Date.now(),imagePath:"",likes:2}).catch((error) =>
      res.status(400).json({ error })
    )
  );
});

module.exports = router;