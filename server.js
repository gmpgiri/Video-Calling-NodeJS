const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "ejs"); //using embedded javascript
app.use(express.static("public")); //use the html and css from the public folder..

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`); //redirecting from home to a random room with dynamic roomId from uuid
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room }); //passing roomId to /:room
});

//when a connection is established
io.on("connection", (socket) => {
  //then, when a user joins a room
  socket.on("join-room", (roomId, userId) => {
    // join the user to the roomId
    socket.join(roomId);
    //and send message to everyone else in the room that a new user of userId has joined the room
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

server.listen(3000);
