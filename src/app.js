const express = require("express");
require("dotenv").config();

const connectDB = require("./config/database");
//connectDB is a async function and it will return promise
//so i have to resolve it

const User = require("./models/user");

const app = express();

app.post("/userPost", async (req, res) => {
  try {
    const user = new User({ firstName: "Surya", lastName: "kanta", age: 21 });
    await user.save();
    res.send("userPost added successfully");
  } catch (err) {
    res.status(500).send("posting not successful");
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
