const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

const connectDB = require("./config/database");
//connectDB is a async function and it will return promise
//so i have to resolve it

const app = express();

//Middleware to parse JSON to object and store to req.body
app.use(express.json());
app.use(cookieParser());

//ROUTERS
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
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
