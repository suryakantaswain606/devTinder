const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    emailId: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      maxLength: 20,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // regex for valid emails
    },
    age: { type: Number, min: 1 },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("add gender from earth");
        }
      },
    },
    objective: { type: String, default: "nodejs learning" },
    skills: { type: [String] },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
