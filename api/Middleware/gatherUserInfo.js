const jwt = require('jsonwebtoken');
const UserSchema = require('../DataSchemas/Users');

async function gatherUserInfo(req, res, next) {
  const accessToken = req.cookies['accesstoken'];

  if (accessToken) {
    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (decodedToken.expire < Date.now()) return res.sendStatus(401);

    const fetchedUser = await UserSchema.findById(decodedToken.uid);

    if (fetchedUser) {
      if (fetchedUser.isDeactivated) return res.sendStatus(403);
      req.user = fetchedUser;
      next();
    } else {
      res.status(404).send('User not found!');
    }
  } else {
    res.sendStatus(401);
  }
}

module.exports = gatherUserInfo;
