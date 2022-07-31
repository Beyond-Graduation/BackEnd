const { Router } = require("express"); // import Router from express
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
const { isAlumniLoggedIn } = require("./middleware"); // import isAlumniLoggedIn custom middleware


const router = Router();

//custom middleware could also be set at the router level like so
// router.use(isLoggedIn) then all routes in this router would be protected



// Index Route with isLoggedIn middleware
router.get("/", isLoggedIn, async (req, res) => {
  const { Blog } = req.context.models;
  if(req.query.blogId){
    var curBlogId  = req.query.blogId
    res.json(
      await Blog.find({blogId : curBlogId}).catch((error) =>
        res.status(400).json({ error })
      )
    );
  }
  else{
    res.json(
      await Blog.find().catch((error) =>
        res.status(400).json({ error })
      )
    );
}
});


// create Route with isLoggedIn middleware
router.post("/create", isAlumniLoggedIn, async (req, res) => {
  const { Blog } = req.context.models;
  const { Alumni } = req.context.models;
  const curUserId = req.user.userId;
  const user = await Alumni.findOne({userId: curUserId  });// get username from req.user property created by isLoggedIn middleware
  req.body.userId = curUserId; // add userId property to req.body
  req.body.firstName = user.firstName
  req.body.lastName = user.lastName
  //create new todo and send it in response
  res.json(
    await Blog.create(req.body).catch((error) =>
      res.status(400).json({ error })
    )
  );
});


module.exports = router;