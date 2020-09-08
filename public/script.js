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
let myVideoStream;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
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

let text = $("input");

$("html").keydown((e) => {
  //13 --> on pressing enter ket
  if (e.which == 13 && text.val().length !== 0) {
    //send message to server
    socket.emit("message", text.val());
    text.val("");
  }
});

socket.on("createMessage", (message) => {
  $(".messages").append(`<li class="message">${message}</li>`);
  scrollToBottom();
});

// always scrolls to bottom when there is a new message is added
const scrollToBottom = () => {
  let d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

//it is possible to copy the current url by adding a dummy text field and using it to copy url
const copyRoomLink = () => {
  let dummy = document.createElement("input"); //creating a dummy text field
  let text = window.location.href; //variable with current url

  document.body.appendChild(dummy); //appending the text field to body element ( it wont be visible to user)
  dummy.value = text; //assiging the current url values to the dummy text field
  dummy.select(); //select function is used to select the contents of the text field
  document.execCommand("copy"); //copy the selected contents to clipbord
  document.body.removeChild(dummy);
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnMuteButton();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
};

const setMuteButton = () => {
  const html = ` <i class="fas fa-microphone"></i>
    <span>Mute</span>`;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnMuteButton = () => {
  const html = ` <i class="disabled fas fa-microphone-slash"></i>
      <span>UnMute</span>`;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setStopButton();
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    setPlayButton();
  }
};

const setPlayButton = () => {
  const html = `<i class="fas fa-video"></i>
    <span> Stop Video </span>`;
  document.querySelector(".main__video-button").innerHTML = html;
};

const setStopButton = () => {
  const html = `<i class="disabled fas fa-video-slash"></i>
      <span> Play Video </span>`;
  document.querySelector(".main__video-button").innerHTML = html;
};
