const jwt = require('jsonwebtoken');
const UserSchema = require('../DataSchemas/Users');

async function gatherUserInfo(req, res, next) {
  const accessToken = req.headers['Authorization'] && req.headers['Authorization'].split(' ')[1];
  console.log(accessToken);

  if (accessToken) {
    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    if (decodedToken.exp < Date.now()) return res.sendStatus(400);

    const fetchedUser = await UserSchema.findById(decodedToken.uid);

    if (fetchedUser) {
      req.user = fetchedUser;
      next();
    } else {
      res.status(404).send('User not found!');
    }
  } else {
    res.sendStatus(400);
  }
}

module.exports = gatherUserInfo;
