const socket = io("/");
const videoGrid = document.getElementById("video-grid");
//create a peer connection on port 3001
//undefined is given as id, so that Peerjs will create its own unique id
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

const myVideo = document.createElement("video");
myVideo.muted = true; // to mute our video's sound on our side
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    //when someone calls, send them our stream
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});
//when peer connection is open, send message to the room that a person of 'id' has joined
myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  //call to a user and send our userId and audio&video stream
  const call = myPeer.call(userId, stream);
  // when a other person send their stream, "stream" event is is invoked
  // then, add their video stream to the page using addVideoStream function
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  //remove the video element on close or "end call"
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
};

//assign the stream to the video html element and appended to videoGrid div element
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};
