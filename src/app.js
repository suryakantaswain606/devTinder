const express = require("express");
require("dotenv").config();
const validateSignUp = require("../src/utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const userAuth = require("./middlewares/auth");

const connectDB = require("./config/database");
//connectDB is a async function and it will return promise
//so i have to resolve it

const User = require("./models/user");

const app = express();

//Middleware to parse JSON to object and store to req.body
app.use(express.json());

app.use(cookieParser());

app.get("/user", async (req, res) => {
  try {
    const user = await User.findOne({ emailId: req.body.email });
    if (!user) {
      return res.status(404).send("user not found");
    }
    res.send(user);
  } catch (err) {
    res.status(500).send("Error fetching user");
  }
});

app.delete("/user", async (req, res) => {
  const id = req.body.id;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (deletedUser == null) {
      return res.status(404).send("User not found or already deleted");
    }
    res.send("user deleted successfully");
  } catch (err) {
    res.status(400).send("something went wrong");
  }
});

app.get("/feed", async (req, res) => {
  try {
    const allUsers = await User.find({});
    if (allUsers.length === 0) {
      return res.status(404).send("No user there");
    }
    res.send(allUsers);
  } catch (err) {
    res.status(500).send("Error Fetching Users");
  }
});

app.patch("/user/:userId", async (req, res) => {
  try {
    // const userId = req.body.userId;
    const emailId = req.body.emailId;
    const age = req.body.age;
    const data = req.body;

    const userId = req.params?.userId;

    const allowedChangeFields = [
      "age",
      "firstName",
      "lastName",
      "gender",
      "objective",
      "skills",
    ];

    const isAllowed = Object.keys(data).every((k) =>
      allowedChangeFields.includes(k)
    );

    if (!isAllowed) {
      throw new Error("field change not allowed");
    }

    if (data?.skills?.length > 10) {
      throw new Error("Skills can't be more than 10");
    }
    const user = await User.findByIdAndUpdate(userId, data, {
      new: true,
    });

    // const user = await User.findOneAndUpdate({ _id: userId }, data, {
    //   new: true,
    // });

    // const user = await User.findOneAndUpdate({ emailId: emailId }, data, {
    //   new: true,
    // });

    // const user = await User.updateMany({ age: age }, data, {
    //   runValidators: true,
    // });
    // const updatedUsers = await User.find({ age: age });
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/signUp", async (req, res) => {
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

app.post("/login", async (req, res) => {
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

app.get("/profile", userAuth, async (req, res) => {
  try {
    const { user } = req;
    res.send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//resolving connectDB async function
connectDB()
  .then(() => {
    console.log("DB connected");
    const port = process.env.PORT;
    app.listen(port, () => {
      console.log("Listening from localhost");
    });
  })
  .catch((err) => {
    console.error("DB not connected");
  });
