const jwt = require("jsonwebtoken");
//user is validated with jwt
module.exports = (req, res, next) => {
  const token = req.header("x-auth-token");//x-auth-token

  if (!token) {
    return res.status(401).json({ message: "Access Denied - No Token" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid Token" });
  }
};

