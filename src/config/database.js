require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  // connect to mongo database
  await mongoose.connect(process.env.MONGO_URL + "/devTinder");
};

module.exports = connectDB;
