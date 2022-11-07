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

fetch("/")
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    youAreLoggedInAs.innerText = data;
  });

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const time = new Date().toLocaleString("en-US").replace(/,/g, "");
  if (chatInput.value) {
    socket.emit("chatMessage", chatInput.value, time);
    chatInput.reset();
  }
});

socket.on("chatMessage", (msg, time) => {
  console(",asdk;jlvbdslkBV;JKSDBV;skj", msg, time);
  messages.innerHTML += `<li class='ownMessage'>: ${msg}<time>${time}</time></li>`;
  messages.scrollTop = messages.scrollHeight;
  // messages.innerHTML += `<li class='othersMessage'>${usr}: ${msg}<time>${time}</time></li>`;
  // messages.scrollTop = messages.scrollHeight;
});

// socket.on("logout", (usr) => {
//   console.log("!#RQGEVAFDBNRYTAHERGWFSVD");
//   messages.innerHTML += `<li class="joinedAndLeftMessage" id="userLeftMessage">${usr} has left</li>`;
//   messages.scrollTop = messages.scrollHeight;
// });
