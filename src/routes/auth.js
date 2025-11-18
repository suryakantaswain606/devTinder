const express = require("express");
const { validateSignUp } = require("../utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authRouter = express.Router();

authRouter.post("/signUp", async (req, res) => {
  try {
    const data = req.body;

    validateSignUp(data);

    if (data?.skills?.length > 10) {
      throw new Error("Skills can't be more than 10");
    }

    const { firstName, lastName, password, emailId, skills } = data;

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hash,
      skills,
    });

    await user.save();

    //offloading jwt token assign logic to userSchema
    const token = user.getJWT();
    res.cookie("token", token, {
      httpOnly: true, // prevents client-side JS access (XSS protection)
      sameSite: "strict", // prevents cross-site request forgery (CSRF)
      secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.send("new user added successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ emailId }).select("+password");
    if (!user) {
      throw new Error("Email not present in DB");
    }

    //offloading bcrypt compare logic to userSchema
    const isPasswordExist = await user.comparePassword(password);

    if (!isPasswordExist) {
      throw new Error("Password is wrong");
    }

    //offloading jwt token assign logic to userSchema
    const token = user.getJWT();
    res.cookie("token", token, {
      httpOnly: true, // prevents client-side JS access (XSS protection)
      sameSite: "strict", // prevents cross-site request forgery (CSRF)
      secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.send("Login Successful");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return res.send("Logout successful");
});

module.exports = authRouter;
