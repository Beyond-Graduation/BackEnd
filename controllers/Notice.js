const { Router } = require("express"); // import Router from express
const { isAdminLoggedIn } = require("./middleware"); // import isAdminLoggedIn custom middleware
const { isAlumniLoggedIn } = require("./middleware"); // import isAlumniLoggedIn custom middleware
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware

const router = Router();

router.post("/create", isLoggedIn, async (req, res) => {
    if(req.user.userType=="Admin"){
        const { Notice } = req.context.models;
        const { Admin } = req.context.models;
        const curUserId = req.user.userId;
        const user = await Admin.findOne({userId: curUserId  });// get username from req.user property created by isLoggedIn middleware
        req.body.userId = curUserId; // add userId property to req.body
        req.body.firstName = user.firstName
        req.body.lastName = user.lastName
        res.json(
            await Notice.create(req.body).catch((error) =>
              res.status(400).json({ error })
            )
          );
        
    }
    else if(req.user.userType=="Alumni"){
        const { NoticePending } = req.context.models;
        const { Alumni } = req.context.models;
        const curUserId = req.user.userId;
        const user = await Alumni.findOne({userId: curUserId  });// get username from req.user property created by isLoggedIn middleware
        console.log(user)
        req.body.userId = curUserId; // add userId property to req.body
        req.body.firstName = user.firstName
        req.body.lastName = user.lastName
        res.json(
            await NoticePending.create(req.body).catch((error) =>
              res.status(400).json({ error })
            )
          );
    }
    else{
        res.status(400).json({ error: curUserId + " do not have the permission to publish notices. " });
    }
  });

// Index Route with isLoggedIn middleware
router.get("/", isLoggedIn, async (req, res) => {
  const { Notice } = req.context.models;
  if(req.query.noticeId){
    var curNoticeId  = req.query.noticeId
    res.json(
      await Notice.find({noticeId : curNoticeId}).catch((error) =>
        res.status(400).json({ error })
      )
    );
  }
  else{
    res.json(
      await Notice.find().catch((error) =>
        res.status(400).json({ error })
      )
    );
}
});

  module.exports = router;