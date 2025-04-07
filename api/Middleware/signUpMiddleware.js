const UsersSchema = require("../DataSchemas/Users");

const signUpMiddleware = async (req, res, next) => {
  const user = req.body;
  if (user.username && user.email && user.password && user.fullname) {
    if (isValidEmail(user.email)) {
      if (!(await UsersSchema.exists({ email: user.email }))) {
        if (!(await UsersSchema.exists({ username: user.username }))) {
          if (!user.password.length < 8) {
            req.user = user;
            next();
          } else {
            res.status(400).json({
              errors: {
                password: "Password is too short!",
              },
            });
          }
        } else {
          res.status(409).json({
            errors: {
              username: "This username is already taken!",
            },
          });
        }
      } else {
        res.status(409).json({
          errors: {
            email: "This email is already used!",
          },
        });
      }
    } else {
      res.status(400).send("Invalid data");
    }
  } else {
    res.status(400).send("Invalid data");
  }
};

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (regex.test(email)) {
    return true;
  } else {
    false;
  }
}

module.exports = signUpMiddleware;
