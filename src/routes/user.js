const express = require("express");
const userAuth = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const User = require("../models/user");
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

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Pagination parameters (always convert to numbers)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (limit > 50) {
      throw new Error("Don't be greedy!");
    }

    const skip = (page - 1) * limit;

    // fields to show publicly in the feed
    const publicUserFields = "firstName lastName photoURL age";

    // 1️⃣ Fetch all connection relations of logged-in user
    const userConnections = await ConnectionRequestModel.find({
      $or: [{ fromUserId: loggedInUserId }, { toUserId: loggedInUserId }],
    }).select("fromUserId toUserId");

    // 2️⃣ Build a set of users to hide
    const excludedUserIds = new Set();

    userConnections.forEach((connection) => {
      excludedUserIds.add(connection.fromUserId.toString());
      excludedUserIds.add(connection.toUserId.toString());
    });

    // Always hide yourself
    excludedUserIds.add(loggedInUserId.toString());

    const excludedIdsArray = [...excludedUserIds];

    // 3️⃣ Total count for pagination
    const totalUsers = await User.countDocuments({
      _id: { $nin: excludedIdsArray },
    });

    // 4️⃣ Fetch feed users (paginated)
    const feedUsers = await User.find({
      _id: { $nin: excludedIdsArray },
    })
      .select(publicUserFields)
      .sort({ _id: 1 }) // important for stable pagination
      .skip(skip)
      .limit(limit);

    // 5️⃣ Respond with feed + pagination metadata
    res.status(200).json({
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      feed: feedUsers,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = userRouter;
