const validateSignUp = ({ firstName, lastName, password }) => {
  if (!firstName || !lastName || !password) {
    throw new Error("don't keep fields empty");
  }
};

const validateProfileEdit = (req) => {
  const allowedChangeFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "skills",
    "photoURL",
    "objective",
  ];

  if (req.body.skills && req.body.skills.length > 10) {
    throw new Error("Skills can't be more than 10");
  }
  const userRequestForChange = req.body;

  // Validate known fields
  const isInvalidField = Object.keys(userRequestForChange).some(
    (field) => !allowedChangeFields.includes(field)
  );

  if (isInvalidField) {
    throw new Error("Field change not allowed");
  }
};

module.exports = { validateSignUp, validateProfileEdit };
