const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("invalid email address : " + value);
        }
      },
    },
    age: { type: Number, min: 1 },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("add either Male or Female or Other");
        }
      },
    },
    objective: { type: String, default: "nodejs learning" },
    skills: { type: [String] },
    photoURL: {
      type: String,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid photo URL : " + value);
        }
      },
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_g_7YVzERozXI_mfnbSPkggiXqlljwtCQXw&s",
    },
    password: { type: String, select: false, required: true },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = function () {
  const user = this;
  const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return token;
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  const user = this;
  const dbHashedPassword = this.password;
  const isPasswordExist = await bcrypt.compare(
    enteredPassword,
    dbHashedPassword
  );
  return isPasswordExist;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
