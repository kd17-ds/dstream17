const User = require("../models/UsersModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");

// This function checks whether the user is logged in or not
module.exports.userVerification = (req, res) => {
  const token = req.cookies.token; // Get the token from browser cookies
  if (!token) {
    return res.json({ status: false }); // If there is no token, user is not logged in
  }
  // Verify the token using the secret key
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.json({ status: false }); // If token is invalid or expired
    } else {
      const user = await User.findById(data.id); // If token is valid, find the user in the database using ID from token
      // If user exists, send success and username
      if (user) return res.json({ status: true, user: user.username });
      else return res.json({ status: false });
    }
  });
};
