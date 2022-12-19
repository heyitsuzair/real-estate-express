/**
 * Middle Ware To Validate JWT
 */
var jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const fetchUser = (req, res, next) => {
  // Get the user from the jwt token and add id to req object
  const token = req.header("authorization");

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user_id = data.user_id;
    next();
  } catch (error) {
    res.status(401).json({ error: true, msg: "Unauthorized!" });
  }
};

module.exports = fetchUser;
