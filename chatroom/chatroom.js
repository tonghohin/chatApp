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

let username;
socket.on("loggedIn", (usr) => {
  username = usr;
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const time = new Date().toLocaleString("en-US").replace(/,/g, "");
  if (chatInput.value) {
    socket.emit("chatMessage", chatInput.value, time);
    messages.innerHTML += `<li class="ownMessage"><span class="username">You: </span>${chatInput.value}<time>${time}</time></li>`;
    messages.scrollTop = messages.scrollHeight;
    chatForm.reset();
  }
});

socket.on("someoneLoggedIn", (usr) => {
  messages.innerHTML += `<li class="joinedAndLeftMessage" id="userJoinedMessage">${usr} has joined</li>`;
  messages.scrollTop = messages.scrollHeight;
});

socket.on("chatMessage", (msg, time, usr) => {
  console.log(",asdk;jlvbdslkBV;JKSDBV;skj", msg, time, usr);
  // messages.innerHTML += `<li class='ownMessage'>${usr}: ${msg}<time>${time}</time></li>`;
  // messages.scrollTop = messages.scrollHeight;
  messages.innerHTML += `<li class="othersMessage"><span class="username">${usr}: </span>${msg}<time>${time}</time></li>`;
  messages.scrollTop = messages.scrollHeight;
});

// socket.on("someoneLoggedIn", (usr) => {
//   messages.innerHTML += `<li class="joinedAndLeftMessage" id="userLeftMessage">${usr} has left</li>`;
//   messages.scrollTop = messages.scrollHeight;
// });
