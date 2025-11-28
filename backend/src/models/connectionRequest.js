const mongoose = require("mongoose");
const User = require("./user");

const connectionRequestSchema = new mongoose.Schema(
  {
    // user who sends the request
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: User,
    },

    // user who receives the request
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: User,
    },

    // request status
    status: {
      type: String,
      enum: ["interested", "ignored", "accepted", "rejected"],
    },
  },
  { timestamps: true }
);

// prevent duplicate requests between same users
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

const ConnectionRequestModel = mongoose.model(
  "ConnectionRequestModel",
  connectionRequestSchema
);

module.exports = ConnectionRequestModel;
