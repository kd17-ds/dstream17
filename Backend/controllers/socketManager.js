// Import the Socket.IO server class
const { Server } = require("socket.io");

// In-memory storage for connections, chat messages, and online time
let connections = {}; // Stores connected users per room/path
let messages = {}; // Stores chat messages per room/path
let timeOnLine = {}; // Tracks when each user connected

// Export a function to initialize and return a Socket.IO server instance
exports.connectToSocket = (server) => {
  // Attach socket.io to the HTTP server
  const io = new Server(server);

  // When a client connects to the server
  io.on("connection", (socket) => {
    // Event: when a user accepts a call and joins a specific path/room
    socket.on("accept-call", (path) => {
      // Initialize the path array if it doesn't exist yet
      if (connections[path] === undefined) {
        connections[path] = [];
      }
      // Save the connected socket ID to this path
      connections[path].push(socket.id);
      // Save the connection time of this user
      timeOnLine[socket.id] = new Date();

      // Inform all users in this path that a new user has joined
      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path] // Send list of all users in the room
        );
      }

      // If there are existing messages in this room, send them to the newly joined user
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

    // Event: signaling message used in WebRTC (like SDP/ICE)
    socket.on("signaL", (told, message) => {
      io.to(told).emit("signal", socket.id, message);
    });

    // Event: new chat message sent by a user
    socket.on("chat-message", (data, sender) => {
      // Find the room this socket belongs to
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }
          return [room, isFound];
        },
        ["", false]
      );

      // If user is in a valid room
      if (found) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }

        // Save the message to history
        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });

        console.log("message", matchingRoom, data, sender);

        // Broadcast the new message to all users in the room
        connections[matchingRoom].forEach((element) => {
          io.to(element).emit("chat-messages", data, sender, socket.id);
        });
      }
    });

    // Event: when a user disconnects (leaves the call)
    socket.on("disconnect", () => {
      // Calculate the time user was online (not currently used)
      var diffTime = Math.abs(timeOnLine[socket.id] - new Date());
      var key;

      // Loop through all paths to find which room this socket belonged to
      for (const [k, v] of JSON.parse(
        JSON.stringify(Object.entries(connections))
      )) {
        for (let a = 0; a < v.length; a++) {
          if (v[a] == socket.id) {
            key = k;

            // Notify others in the room that the user left
            for (let a = 0; a < connections[key].length; a++) {
              io.to(connections[key][a]).emit("user-left", socket.id);
            }

            // Remove the socket from the room
            var index = connections[key].indexOf(socket.id);
            connections[key].splice(index, 1);

            // If no one is left in the room, delete it
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
