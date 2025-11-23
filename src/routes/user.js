const express = require("express");
const userAuth = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const userRouter = express.Router();

// get all received requests
userRouter.get("/user/requests/received/", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // find all requests sent to the logged-in user
    const requests = await ConnectionRequestModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "photoURL",
      "age",
      "gender",
    ]);

    if (!requests.length) {
      return res.send("No requests");
    }

    res.json({ data: requests });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// get all accepted connections (friends)
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // find connections where user is either fromUser or toUser
    const connections = await ConnectionRequestModel.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      // populate details of both sides
      .populate("fromUserId", "firstName lastName photoURL")
      .populate("toUserId", "firstName lastName photoURL");

    if (!connections.length) {
      return res.status(400).send("sorry u r alone here");
    }

    // return only the other user
    const finalConnections = connections.map((ele) => {
      return ele.fromUserId._id.toString() === loggedInUser._id.toString()
        ? ele.toUserId
        : ele.fromUserId;
    });

    res.status(200).json({ connections: finalConnections });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = userRouter;
