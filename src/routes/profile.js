const express = require("express");
const userAuth = require("../middlewares/auth");
const { validateProfileEdit } = require("../utils/validation");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

// get logged-in user's profile
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const { user } = req;
    res.send(user); // return user data
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// edit profile details
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    validateProfileEdit(req); // validate fields

    const user = req.user;

    // update only provided fields
    Object.keys(req.body).forEach((key) => (user[key] = req.body[key]));

    await user.save();

    res.send("Profile updated successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// update password
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { password: currentPassword, newPassword } = req.body;

    // check required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).send("Both passwords are required");
    }

    const user = req.user;

    // verify current password
    if (!(await user.comparePassword(currentPassword))) {
      throw new Error("Invalid current Password");
    }

    // set new password
    user.password = newPassword;
    await user.save();

    res.send("Password updated successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = profileRouter;
