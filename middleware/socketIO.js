import socket from "socket.io";

// Models

import Comment from "../models/Comment";

const socketIO = (server) => {
  const io = socket(server, { wsEngine: "eiows" });
  io.on("connection", (socket) => {
    socket.on("disconnect", () => console.log(`Disconnected: ${socket.id}`));

    // Add user to a specific room
    socket.on("join", async (room) => {
      //
      socket.join(room);
    });

    // Load old comments when user joined the room
    socket.on("load", async (room) => {
      const comments = await Comment.find({ room: room }).populate("user");

      socket.emit("load-old-comment", comments);
    });

    // Receive comment from user
    socket.on("comment", async ({ room, user, comment }) => {
      const newComment = new Comment({
        room: room,
        user: user,
        content: comment,
      });
      await newComment.save();

      // Send back to all the client in the room
      socket.broadcast
        .to(room)
        .emit("new-comment", await Comment.populate(newComment, ["user"]));
      // Send back to the sender
      socket.emit("new-comment", await Comment.populate(newComment, ["user"]));
    });
  });
};

export default socketIO;
