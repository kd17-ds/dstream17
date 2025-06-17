const UsersModel = require("../models/UsersModel.js");
const { createSecretToken } = require("../utils/secretToken.js");
const bcrypt = require("bcrypt");

module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username, createdAt } = req.body;
    const existingUser = await UsersModel.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const user = await UsersModel.create({
      email,
      password,
      username,
      createdAt,
    });
    const token = createSecretToken(user._id); // Create a JWT token using the user's ID
    // Store the token in browser cookies
    res.cookie("token", token, {
      withCredentials: true, // allows frontend to send/receive cookies
      httpOnly: false, // not restricting access to client-side JS
    });
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
    next();
  } catch (error) {
    console.error(error);
  }
};

module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: "All fields are required" });
    }
    const user = await UsersModel.findOne({ email });
    if (!user) {
      return res.json({ message: "Incorrect password or email" });
    }
    // Compare entered password with hashed password in DB
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({ message: "Incorrect password or email" });
    }
    // If password is correct, create a token
    const token = createSecretToken(user._id);
    // Set the token in cookie
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res
      .status(201)
      .json({ message: "User logged in successfully", success: true });
    next();
  } catch (error) {
    console.error(error);
  }
};
