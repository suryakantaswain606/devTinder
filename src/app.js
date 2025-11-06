const express = require("express");
require("dotenv").config();
const validateSignUp = require("../src/utils/validation");
const bcrypt = require("bcrypt");

const connectDB = require("./config/database");
//connectDB is a async function and it will return promise
//so i have to resolve it

const User = require("./models/user");

const app = express();

//Middleware to parse JSON to object and store to req.body
app.use(express.json());

app.get("/user", async (req, res) => {
  try {
    const user = await User.findOne({ emailId: req.body.email });
    if (user.length === 0) {
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
      new: "true",
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

    const { firstName, lastName, password, emailId } = data;

    const hash = await bcrypt.hash(password, 10);

    const user = new User({ firstName, lastName, emailId, password: hash });

    if (data?.skills?.length > 10) {
      throw new Error("Skills can't be more than 10");
    }
    await user.save();
    res.send("userPost added successfully");
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

    const isPasswordExist = await bcrypt.compare(password, user.password);
    console.log(isPasswordExist);

    if (!isPasswordExist) {
      throw new Error("Password is wrong");
    }

    res.send("LogIn Successful");
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
