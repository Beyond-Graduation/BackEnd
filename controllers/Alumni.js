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
  if (req.query.department) {
    var dept = req.query.department;
    console.log("Department:", dept);
    res.json(
      await Alumni.find({ department: dept }).lean().collation({'locale':'en'}).sort({firstName:1,lastName:1,dateJoined:-1,updated:-1}).catch((error) =>
        res.status(400).json({ error })
      )
    );
  } else if(req.query.sort=="name"){
    res.json(
      await Alumni.find()
        .lean().collation({'locale':'en'}).sort({firstName:1,lastName:1,dateJoined:-1,updated:-1})
        .catch((error) => res.status(400).json({ error }))
    );

  }
  else if(req.query.sort=="latest"){
    res.json(
      // likes:-1 => descending , dateUploaded:-1 ==> latest
      await Alumni.find()
        .lean().collation({'locale':'en'}).sort({dateJoined:-1,updated:-1})
        .catch((error) => res.status(400).json({ error }))
    );

  }
  else if(req.query.sort=="oldest"){
    res.json(
      // dateUploaded:1 ==> oldest
      await Alumni.find()
        .lean().collation({'locale':'en'}).sort({dateJoined:1,updated:1})
        .catch((error) => res.status(400).json({ error }))
    );
    return;

  }
  else{
    res.json(
      await Alumni.find()
        .lean().collation({'locale':'en'}).sort({firstName:1,lastName:1,dateJoined:-1,updated:-1})
        .catch((error) => res.status(400).json({ error }))
    );
  }
});

router.get("/alumni_details", isLoggedIn, async (req, res) => {
  const userType = req.user.userType;
  const reqUserId = req.user.userId;
  const { Alumni } = req.context.models;
  if (req.query.userId) {
    var curUserId = req.query.userId;
    // console.log(req.query.userId)
    // console.log("User Id:",curUserId);
    var resUser = await Alumni.findOne({ userId: curUserId }).lean().catch((error) =>
      res.status(400).json({ error })
    );
    if (userType === "Student") {
      console.log(userType);
      const { Student } = req.context.models;
      const user = await Student.findOne({ userId: reqUserId });
      if (user.favAlumId.includes(curUserId)) resUser.isFavourite = true;
      else resUser.isFavourite = false;
    }
    res.json(resUser);
  }
});

router.post("/filter", isLoggedIn, async (req, res) => {
  const { Alumni } = req.context.models;
  var query = {};
  if (req.body.department) {
    query.department = req.body.department;
  }
  if (req.body.areasOfInterest) {
    query.areasOfInterest = { $all: req.body.areasOfInterest };
  }
  if (req.body.before && req.body.after) {
    query.yearGraduation = { $gte: req.body.after, $lte: req.body.before };
  } else if (req.body.after) {
    query.yearGraduation = { $gte: req.body.after };
  } else if (req.body.before) {
    query.yearGraduation = { $lte: req.body.before };
  }
  console.log("QUERY :", query);
  res.json(
    await Alumni.find(query).catch((error) => res.status(400).json({ error }))
  );
});

// Signup route to create a new user
router.post("/signup", async (req, res) => {
  const { AlumniPending } = req.context.models;
  try {
    // hash the password
    req.body.password = await bcrypt.hash(req.body.password, 10);
    req.body.updated = Date.now();
    req.body.likedBlogs = [];
    // create a new user
    await AlumniPending.create(req.body);
    var user = await AlumniPending.findOne({ userId: req.body.userId }).lean();
    const totalFields = 14;
    var emptyFields = 0;
    const exclusions = ["bookmarkBlog", "favAlumId", "__v"];
    for (const key of Object.keys(user)) {
      if (user[key] || exclusions.includes(key)) {
      } else {
        console.log(key);
        emptyFields++;
      }
    }
    req.body.profileCompletionPerc = parseInt(
      100 - (emptyFields / totalFields) * 100
    );
    await AlumniPending.updateOne({ userId: user.userId }, req.body);

    user = await AlumniPending.findOne({ userId: user.userId }).lean();
    res.json(user);
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Update route to update details
router.post("/update", isLoggedIn, async (req, res) => {
  const curUserId = req.user.userId;
  const { Alumni } = req.context.models;

  try {
    // check if the user exists
    var user = await Alumni.findOne({ userId: curUserId }).lean();
    req.body.updated = Date.now();
    if (user) {
      //check if password matches
      await Alumni.updateOne({ userId: curUserId }, req.body);
      var user = await Alumni.findOne({ userId: curUserId }).lean();
      console.log(user);
      const totalFields = 14;
      var emptyFields = 0;
      const exclusions = ["bookmarkBlog", "favAlumId", "__v"];
      for (const key of Object.keys(user)) {
        if (user[key] || exclusions.includes(key)) {
        } else {
          emptyFields++;
        }
      }
      req.body.profileCompletionPerc = parseInt(
        100 - (emptyFields / totalFields) * 100
      );
      await Alumni.updateOne({ userId: user.userId }, req.body);
      // send updated user as response
      user = await Alumni.findOne({ userId: curUserId });
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
    const curUserId = req.body.userId;
    const confirm = req.body.isDelete;
    if (confirm) {
      const { Alumni } = req.context.models;
      const { Blog } = req.context.models;
      await Blog.remove({ userId: curUserId });
      await Alumni.remove({ userId: curUserId });
      res.send("Deleted Successfully");
    } else {
      res.send("Verify CONFIRM key");
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Route to add bookmarks
router.post("/bookmark", isLoggedIn, async (req, res) => {
  const curUserId = req.user.userId;
  const newblogId = req.body.blogId;
  const { Alumni } = req.context.models;
  try {
    // check if the user exists
    const user = await Alumni.findOne({ userId: curUserId });
    req.body.updated = Date.now();
    var curBookmarkBlogs = user.bookmarkBlog;

    if (user && curBookmarkBlogs.includes(newblogId) == false) {
      curBookmarkBlogs.push(newblogId);
      console.log(curBookmarkBlogs);
      await Alumni.updateOne(
        { userId: curUserId },
        { bookmarkBlog: curBookmarkBlogs }
      );
      // send updated user as response
      const user = await Alumni.findOne({ userId: curUserId });
      res.json(user);
    } else {
      res.status(400).json({ error: newblogId + " is already Bookmarked!" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Route toget bookmarks
router.get("/bookmarklist", isLoggedIn, async (req, res) => {
  const curUserId = req.user.userId;
  const { Alumni } = req.context.models;
  try {
    // check if the user exists
    const user = await Alumni.findOne({ userId: curUserId });

    if (user) {
      var curBookmarkBlogs = user.bookmarkBlog;
      console.log(curBookmarkBlogs);
      res.json(curBookmarkBlogs);
    } else {
      res.status(400).json({ error: curUserId + " Does Not exist" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
