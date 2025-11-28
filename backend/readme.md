_to do anything with the mongoDB_
->create a config folder inside src
->create a file called database.js inside config folder
->i will use mongoose library
->writing MongoDB validation, casting and business logic boilerplate is a drag. That's why we wrote Mongoose.
->npm i mongoose
->const mongoose = require("mongoose");
->mongoose.connect("connecting string") it will return a promise
->so, better await it inside a async function
->const connectDB=async () {
try {
await mongoose.connect("connection string");
console.log("Connected");
} catch (err) {
console.error("Error:", err);
}
}
connectDB();

->require("./config/database"); in app.js because app.js is main file
->by this, every line of code of database.js will be present here
->now, i am connected to cluster
->in that cluster, there can be multiple DB
->if i wanna connect to a specific DB inside that cluster then
->await mongoose.connect("connection string/DBname"); here /DBname added to connecting string
