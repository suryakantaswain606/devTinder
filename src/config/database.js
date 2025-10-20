const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://surya:gfyhfhgfvhjfh@surya.zisjgh0.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
