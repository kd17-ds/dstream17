const { Server } = require("socket.io"); // Importing the Server class from the 'socket.io' package

// Exporting a function that sets up and returns a Socket.IO server instance
exports.connectToSocket = (server) => {
  // Creating a new Socket.IO server and attaching it to the given HTTP server
  const io = new Server(server);

  return io; // Return the initialized Socket.IO instance so it can be used elsewhere (like in `index.js`)
};
