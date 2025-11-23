const express = require("express");
const mongoose = require("mongoose");
const ConnectionRequestModel = require("../models/connectionRequest");
const userAuth = require("../middlewares/auth");
const User = require("../models/user");

const requestRouter = express.Router();

requestRouter.post("/request/:toUserId/:status", userAuth, async (req, res) => {
  try {
    const { toUserId, status } = req.params;
    const fromUserId = req.user._id;

    // 1. Validate ObjectId
    if (!mongoose.isValidObjectId(toUserId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    // 2. Prevent self-request
    if (fromUserId.toString() === toUserId.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot send request to yourself" });
    }

    // 3. Target user must exist
    const isExist = await User.findById(toUserId);
    if (!isExist) {
      return res.status(400).json({ error: "Recipient user not found" });
    }

    // 4. Allowed statuses
    const statusList = ["interested", "ignored"];
    if (!statusList.includes(status)) {
      return res
        .status(400)
        .json({ error: `status: ${status} not handled by this API` });
    }

    // 5. Check if request already exists (both directions)
    const isConnectionExist = await ConnectionRequestModel.findOne({
      $or: [
        { fromUserId: fromUserId, toUserId: toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (isConnectionExist) {
      return res.status(400).json({ error: "Connection already present" });
    }

    // 6. Create connection request
    const newConnection = await ConnectionRequestModel.create({
      toUserId,
      fromUserId,
      status,
    });

    return res.status(200).json({
      message: "Connection request created successfully",
      data: newConnection,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      // 1. Validate status
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ error: "Invalid status code" });
      }

      // 2. Validate requestId
      if (!mongoose.isValidObjectId(requestId)) {
        return res.status(400).json({ error: "Invalid request ID" });
      }

      // 3. Find the request (correct way)
      const request = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!request) {
        return res.status(400).json({ error: "Request not found" });
      }

      // 4. Update status
      request.status = status;
      await request.save();

      return res.status(200).json({
        message: `Request ${status} successfully`,
        data: request,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

module.exports = requestRouter;
