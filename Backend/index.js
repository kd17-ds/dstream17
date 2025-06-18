// Load environment variables from .env (only in dev mode)
if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const mongoose = require("mongoose");
const dbUrl = process.env.MONGO_URL;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRoute = require("./routes/AuthRoutes");
const { createServer } = require("http"); // Create HTTP server manually (needed to hook into Socket.IO)
const { connectToSocket } = require("./controllers/socketManager"); // Custom function that sets up and returns a Socket.IO server

const server = createServer(app); // Create an HTTP server from the Express app
const io = connectToSocket(server); // Hook Socket.IO into the HTTP server // NEW: Socket.IO is initialized from socketManager.js

app.use(express.static(path.join(__dirname, "client", "dist"))); // Serve frontend static files (like React build)
app.set("trust proxy", 1); // For trusting proxies (like when deployed on Render, Vercel, etc.)

// Handle CORS – allows frontend (from another origin) to connect to backend
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/", authRoute);

main()
  .then((res) => {
    console.log("DATABASE CONNECTED");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

server.listen(port, () => {
  console.log("Server is running on port 3000");
});
