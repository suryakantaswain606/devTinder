const express = require("express");
require("dotenv").config();

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

app.patch("/user", async (req, res) => {
  try {
    // const userId = req.body.userId;
    const emailId = req.body.emailId;
    const age = req.body.age;
    const data = req.body;

    // const user = await User.findByIdAndUpdate(userId, data, {
    //   new: "true",
    // });

    // const user = await User.findOneAndUpdate({ _id: userId }, data, {
    //   new: true,
    // });

    const user = await User.findOneAndUpdate({ emailId: emailId }, data, {
      new: true,
    });

    // const user = await User.updateMany({ age: age }, data, {
    //   runValidators: true,
    // });
    // const updatedUsers = await User.find({ age: age });
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).send(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user");
  }
});

app.post("/userPost", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.send("userPost added successfully");
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
