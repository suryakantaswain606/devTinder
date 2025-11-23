const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },

    // email field validation
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

    // gender enum
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },

    objective: { type: String, default: "nodejs learning" },
    skills: { type: [String] },

    // profile image validation
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

    password: { type: String, required: true },
  },
  { timestamps: true }
);

// hash password before save
userSchema.pre("save", async function (next) {
  const user = this;

  // only hash when password is newly set/changed
  if (!user.isModified("password")) return next();

  user.password = await bcrypt.hash(user.password, 10);
  next();
});

// generate JWT token
userSchema.methods.getJWT = function () {
  const user = this;

  return jwt.sign({ _id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// compare entered password with db password
userSchema.methods.comparePassword = async function (enteredPassword) {
  const user = this;

  return await bcrypt.compare(enteredPassword, user.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
