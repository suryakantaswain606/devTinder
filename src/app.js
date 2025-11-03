const express = require("express");
require("dotenv").config();

const connectDB = require("./config/database");
//connectDB is a async function and it will return promise
//so i have to resolve it

const User = require("./models/user");

const app = express();

//Middleware to parse JSON to object and store to req.body
app.use(express.json());

app.post("/userPost", async (req, res) => {
  try {
    const user = new User(req.body);
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
