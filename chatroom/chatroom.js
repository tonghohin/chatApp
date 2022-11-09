const socket = io();
const messages = document.querySelector("#messages");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const youAreLoggedInAs = document.querySelector("#youAreLoggedInAs");

// window.addEventListener("beforeunload", () => {
//   socket.emit("logout", username);
//   sessionStorage.removeItem("socketID");
//   sessionStorage.removeItem("username");
// });

// socket.on("disconnect", () => {
//   socket.emit("logout", username);
// });

// socket.on("checkLoginUsernameAndPassword", (usr, matchedUsernameAndPassword) => {
//   if (matchedUsernameAndPassword) {
//     messages.innerHTML += `<li class="joinedAndLeftMessage" id="userJoinedMessage">${usr} has joined</li>`;
//     messages.scrollTop = messages.scrollHeight;
//   }
// });

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const time = new Date().toLocaleString("en-US").replace(/,/g, "");
  if (chatInput.value) {
    socket.emit("chatMessage", chatInput.value, time);
    chatForm.reset();
  }
});

let myself;
// fetch("/getusername")
//   .then((res) => res.json())
//   .then((data) => {
//     youAreLoggedInAs.innerHTML = data.USERNAME;
//     socket.emit("loggedIn", data);
//     myself = data;
//     console.log("DATAAAA", data);
//   });

// socket.on("loggedIn", (username) => {
//   messages.innerHTML += `<li class="joinedAndLeftMessage" id="userJoinedMessage">${username} has joined</li>`;
//   messages.scrollTop = messages.scrollHeight;
// });

socket.on("chatMessage", (msg, time, username) => {
  console.log(",asdk;jlvbdslkBV;JKSDBV;skj", msg, time, username);
  messages.innerHTML += `<li class='ownMessage'>${username}: ${msg}<time>${time}</time></li>`;
  messages.scrollTop = messages.scrollHeight;
  // messages.innerHTML += `<li class='othersMessage'>${usr}: ${msg}<time>${time}</time></li>`;
  // messages.scrollTop = messages.scrollHeight;
});

// socket.on("logout", (usr) => {
//   console.log("!#RQGEVAFDBNRYTAHERGWFSVD");
//   messages.innerHTML += `<li class="joinedAndLeftMessage" id="userLeftMessage">${usr} has left</li>`;
//   messages.scrollTop = messages.scrollHeight;
// });
