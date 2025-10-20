const adminAuth = (req, res, next) => {
  console.log("Admin auth is getting checked");
  const token = "xyz";

  req.isAdminAuthorized = token == "xyz";
  req.isAdminAuthorized ? next() : res.status(401).send("admin unauthorized");
};
const userAuth = (req, res, next) => {
  console.log("User auth is getting checked");
  const token = "xyz";

  req.isUserAuthorized = token == "xyz";
  req.isUserAuthorized ? next() : res.status(401).send("user unauthorized");
};

module.exports = { adminAuth, userAuth };
