// Import the Socket.IO server class to create a WebSocket server that works over an HTTP server
const { Server } = require("socket.io");

// In-memory storage for tracking active socket connections, message history, and online time
let connections = {}; // Stores connected users per room/path
let messages = {}; // Stores chat messages per room/path
let timeOnLine = {}; // Tracks when each user connected

// Export a function to initialize and return a Socket.IO server instance
exports.connectToSocket = (server) => {
  // Attach socket.io to the HTTP server with CORS settings
  const io = new Server(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
      credentials: true,
    },
  });

  // Handle new WebSocket connection
  io.on("connection", (socket) => {
    console.log("SOMETHING CONNNECTED");
    // Event: when a user accepts a call and joins a specific room/path
    socket.on("accept-call", (path) => {
      // Create an array for the path if it doesn't exist
      if (connections[path] === undefined) {
        connections[path] = [];
      }

      // Store the socket ID in that path's connection list
      connections[path].push(socket.id);

      // Save the connection time for later reference
      timeOnLine[socket.id] = new Date();

      // Notify all users in the room that a new user joined
      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path] // Send the full list of users in the room
        );
      }

      // Send chat history to the newly joined user if any
      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; a++) {
          io.to(socket.id).emit(
            "chat-message",
            messages[path][a]["data"],
            messages[path][a]["sender"],
            messages[path][a]["socket-id-sender"]
          );
        }
      }
    });

    // Event: signaling message for WebRTC (e.g., SDP or ICE info)
    socket.on("signaL", (told, message) => {
      io.to(told).emit("signal", socket.id, message);
    });

    // Event: when a user sends a chat message
    socket.on("chat-message", (data, sender) => {
      // Find which room the sender belongs to
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }
          return [room, isFound];
        },
        ["", false]
      );

      // If the user is in a valid room
      if (found) {
        // Initialize message history array if not already
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }

        // Store the message in the message history
        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });

        console.log("message", matchingRoom, data, sender);

        // Send the message to everyone in the room
        connections[matchingRoom].forEach((element) => {
          io.to(element).emit("chat-messages", data, sender, socket.id);
        });
      }
    });

    // Event: when a user disconnects
    socket.on("disconnect", () => {
      // (Optional) Calculate session duration
      var diffTime = Math.abs(timeOnLine[socket.id] - new Date());
      var key;

      // Find which room the disconnected user belonged to
      for (const [k, v] of JSON.parse(
        JSON.stringify(Object.entries(connections))
      )) {
        for (let a = 0; a < v.length; a++) {
          if (v[a] == socket.id) {
            key = k;

            // Inform other users in the room
            for (let a = 0; a < connections[key].length; a++) {
              io.to(connections[key][a]).emit("user-left", socket.id);
            }

            // Remove user from the connection list
            var index = connections[key].indexOf(socket.id);
            connections[key].splice(index, 1);

            // If room is empty, delete it
            if (connections[key].length === 0) {
              delete connections[key];
            }
          }
        }
      }
    });
  });

  return io; // Return the Socket.IO instance so it can be used in index.js
};
