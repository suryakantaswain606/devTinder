const validateSignUp = ({ firstName, lastName, password }) => {
  if (!firstName || !lastName || !password) {
    throw new Error("don't keep fields empty");
  }
};

module.exports = validateSignUp;
