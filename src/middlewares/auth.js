const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies; // get token from cookie

    if (!token) {
      throw new Error("Invalid token. Please, Login");
    }

    // verify token
    const validated = jwt.verify(token, process.env.JWT_SECRET);

    const { _id } = validated;

    // find user from token payload
    const user = await User.findById(_id).select("+password");

    if (!user) {
      throw new Error("No user in DB");
    }

    req.user = user; // attach user to request

    next(); // go to next middleware/route
  } catch (err) {
    // handle token-specific errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).send("Session expired. Please log in again.");
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).send("Invalid token. Please log in again.");
    }

    if (err.name === "NotBeforeError") {
      return res.status(401).send("Token not active yet. Try again later.");
    }

    console.error("Auth Middleware Error:", err);
    return res.status(500).send("Authentication failed. Please try again.");
  }
};

module.exports = userAuth;
