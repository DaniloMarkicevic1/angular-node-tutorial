const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Get token
    const token = req.headers.authorization.split(" ")[1];

    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    console.log("🚀 ~ file: check-auth.js:10 ~ decodedToken:", decodedToken);

    req.userData = { email: decodedToken.email, userId: decodedToken.userId };

    next();
  } catch (error) {
    res.status(401).json({ message: "You are not authenticated!" });
  }
};
