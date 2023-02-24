require("dotenv").config(); // load .env variables
const { Router } = require("express"); // import router from express
const nodemailer = require("nodemailer"); // import nodemailer to send emails
const bcrypt = require("bcryptjs"); // import bcrypt to hash passwords
const jwt = require("jsonwebtoken"); // import jwt to sign tokens
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
// const User = require("../models/User");

const router = Router(); // create router to create route bundle

//DESTRUCTURE ENV VARIABLES WITH DEFAULTS
const { SECRET = "secret" } = process.env;

// Login route to verify a user and get a token
// Single Login for all
router.post("/login", async (req, res) => {
  const { User } = req.context.models;
  try {
    const user = await User.findOne({ email: req.body.email });
    console.log(user);
    // check if the user exists
    if (user) {
      //check if password matches
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        if (user.__t == "AlumniPending") {
          res.status(400).json({ error: "Institute Verification Pending!" });
          return;
        }
        // sign token and send it in response
        const token = await jwt.sign(
          { userId: user.userId, userType: user.__t },
          SECRET
        );
        res.json({ token: token, userId: user.userId, userType: user.__t });
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

router.post("/change_password", isLoggedIn, async (req, res) => {
  const { User } = req.context.models;
  const curUserId = req.user.userId;
  var user = await User.findOne({ userId: curUserId }).lean();
  try {
    const result = await bcrypt.compare(req.body.oldPassword, user.password);
    if (result) {
      req.body.newPassword = await bcrypt.hash(req.body.newPassword, 10);
      req.body.updated = Date.now();
      await User.updateOne(
        { userId: curUserId },
        { password: req.body.newPassword, updated: req.body.updated }
      );
      // console.log(user);
      user = await User.findOne({ userId: curUserId }).lean();

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.MAIL_ID,
          pass: process.env.MAIL_PASSWORD,
        },
      });
      const options = {
        from: process.env.MAIL_ID,
        to: user.email,
        subject: "BeGrad : Your password has been successfully Updated!",
        text: "Hi, \nYour password has been successfully updated. Incase this was not an update from your side, do change the password as soon as possible using Forgot password option to ensure security.\n\nRegards,\nBeyond Graduation,\nCETAA",
      };
      transporter.sendMail(options, function (err, info) {
        if (err) {
          console.log(err);
          return;
        }
        console.log("Sent :" + info.response);
      });

      res.json(user);
    } else {
      res.status(400).send("Incorrect Password");
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

// forgot password request

// declare all characters
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateString(length) {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

// To send a mail with a reset link of the form https://localhost:4000/reset_password/uniqueGeneratedToken
router.post("/forgot_password", async (req, res) => {
  const { User } = req.context.models;
  let user = await User.findOne({ email: req.body.email }).lean();
  if (user) {
    const passwordResetToken = generateString(15);
    console.log(passwordResetToken);
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    const options = {
      from: process.env.MAIL_ID,
      to: req.body.email,
      subject: "BeGrad : Password Reset Link!",
      text:
        "Hi, \nFollowing your request to reset password to login, we have generated a unique password reset link below:\n" +
        "https://localhost:4000/reset_password/" +
        passwordResetToken +
        "  \nKindly click on the link quickly to reset your password.\n\nRegards,\nBeyond Graduation,\nCETAA",
    };
    transporter.sendMail(options, function (err, info) {
      if (err) {
        console.log(err);
        return;
      }
      console.log("Sent :" + info.response);
    });
    req.body.updated = Date.now();
    await User.updateOne(
      { email: req.body.email },
      { passwordResetToken: passwordResetToken, updated: req.body.updated }
    );
    user = await User.findOne({ email: req.body.email }).lean();
    res.json(user);
  } else {
    res.status(400).send("User with this email doesn't exist!");
  }
});

// // resetting password as it was forgot :)
router.post("/reset_password", async (req, res) => {
  const { User } = req.context.models;
  let user = await User.findOne({
    passwordResetToken: req.body.passwordResetToken,
  }).lean();
  if (user) {
    req.body.updated = Date.now();
    req.body.newPassword = await bcrypt.hash(req.body.newPassword, 10);
    await User.updateOne(
      { passwordResetToken: req.body.passwordResetToken },
      { password: req.body.newPassword, updated: req.body.updated }
    );
    user = await User.findOne({
      passwordResetToken: req.body.passwordResetToken,
    }).lean();

    // Resetting the passwordResetToken to default "000000000000000"
    // to avoid duplicate password resets
    await User.updateOne(
      { userId: user.userId },
      { passwordResetToken: "000000000000000" }
    );

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    const options = {
      from: process.env.MAIL_ID,
      to: user.email,
      subject: "BeGrad : Your password has been reset!",
      text: "Hi, \nYour password has been successfully reset following your request. Log in back to the website to continue.\n\nRegards,\nBeyond Graduation,\nCETAA",
    };
    transporter.sendMail(options, function (err, info) {
      if (err) {
        console.log(err);
        return;
      }
      console.log("Sent :" + info.response);
    });

    res.json(user);
  } else {
    res
      .status(400)
      .send(
        "Invalid Password Reset link!, Kindly proceed to forgot password again for a new link"
      );
  }
});

module.exports = router;
