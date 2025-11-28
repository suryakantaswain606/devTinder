const express = require("express");
const { validateSignUp } = require("../utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authRouter = express.Router();

// user signup
authRouter.post("/signUp", async (req, res) => {
  try {
    const data = req.body;

    validateSignUp(data); // validate signup data

    if (data?.skills?.length > 10) {
      throw new Error("Skills can't be more than 10");
    }

    const { firstName, lastName, password, emailId, skills, gender } = data;

    // create new user document
    const user = new User({
      firstName,
      lastName,
      emailId,
      password,
      skills,
      gender,
    });

    await user.save();

    // generate JWT token (method in user model)
    const token = user.getJWT();

    // set cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.send("new user added successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// user login
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      throw new Error("Email and password are required");
    }

    // find user and include password field
    const user = await User.findOne({ emailId }).select("+password");

    if (!user) {
      throw new Error("Email not present in DB");
    }

    // check password (method in user model)
    const isPasswordExist = await user.comparePassword(password);

    if (!isPasswordExist) {
      throw new Error("Password is wrong");
    }

    // generate JWT token
    const token = user.getJWT();

    // set cookie
    res.cookie("token", token, {
      httpOnly: true, // prevents JS access to cookie (XSS protection)
      sameSite: "strict", // blocks cross-site cookie sending (CSRF protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // cookie valid for 7 days
    });

    res.send("Login Successful");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// user logout
authRouter.post("/logout", (req, res) => {
  // clear auth cookie
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.send("Logout successful");
});

module.exports = authRouter;
