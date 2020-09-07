const socket = io("/");

//create a peer connection on port 3001
//undefined is given as id, so that Peerjs will create its own unique id
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

//when peer connection is open, send message to the room that a person of 'id' has joined
myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-connected", (userId) => {
  console.log("User Connected:" + userId);
});
