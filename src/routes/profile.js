const express = require("express");
const userAuth = require("../middlewares/auth");
const { validateProfileEdit } = require("../utils/validation");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const { user } = req;
    res.send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    validateProfileEdit(req);

    const user = req.user;

    Object.keys(req.body).forEach((ele) => (user[ele] = req.body[ele]));

    await user.save();
    res.send("Profile updated successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { password: currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).send("Both passwords are required");
    }
    const user = req.user;
    if (!(await user.comparePassword(currentPassword))) {
      throw new Error("Invalid current Password");
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();

    return res.send("Password updated successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = profileRouter;
