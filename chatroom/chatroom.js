const socket = io();
const messages = document.querySelector("#messages");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const youAreLoggedInAs = document.querySelector("#youAreLoggedInAs");
const listIcon = document.querySelector("#listIcon");
const userlist = document.querySelector(".userlist");

fetch("/getpreivouschats")
  .then((res) => res.json())
  .then((data) => {
    for (const chatObject of data.previouschats) {
      if (chatObject.username === data.username) {
        messages.innerHTML += `
          <li class="ownMessage"><span class="username">You: </span>${chatObject.chat}<time>${new Date(chatObject.timestamp).toLocaleString("en-US", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }).replace(/,/g, "")}</time></li>`;
        messages.scrollTop = messages.scrollHeight;
      } else {
        messages.innerHTML += `
         <li class="othersMessage"><span class="username">${chatObject.username}: </span>${chatObject.chat} <time>${new Date(chatObject.timestamp).toLocaleString("en-US", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }).replace(/,/g, "")}</time></li>`;
        messages.scrollTop = messages.scrollHeight;
      }
    }
  });

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const time = new Date().toISOString();
  if (chatInput.value) {
    console.log(time);
    socket.emit("chatMessage", chatInput.value, time);
    messages.innerHTML += `<li class="ownMessage"><span class="username">You: </span>${chatInput.value}<time>${new Date(time).toLocaleString("en-US").replace(/,/g, "")}</time></li>`;
    messages.scrollTop = messages.scrollHeight;
    chatForm.reset();
  }
});

listIcon.addEventListener("click", () => {
  userlist.classList.toggle("appear");

  if (userlist.classList.contains("appear")) {
    fetch("/getuserList")
      .then((res) => res.json())
      .then((data) => {
        for (const userObject of data.userlist) {
          if (userObject.USERNAME === data.username) {
            continue;
          }
          userlist.innerHTML += `<li>${userObject.USERNAME}</li>`;
        }
      });
  }
});

const USER_LIST = [];
socket.on("someoneLoggedIn", (usr) => {
  if (!USER_LIST.includes(usr)) {
    messages.innerHTML += `<li class="joinedAndLeftMessage" id="userJoinedMessage">${usr} has joined</li>`;
    messages.scrollTop = messages.scrollHeight;
    USER_LIST.push(usr);
  }
});

socket.on("someoneLoggedOut", (usr) => {
  messages.innerHTML += `<li class="joinedAndLeftMessage" id="userLeftMessage">${usr} has left</li>`;
  messages.scrollTop = messages.scrollHeight;
  USER_LIST.splice(USER_LIST.indexOf(usr), 1);
});

socket.on("chatMessage", (msg, time, usr) => {
  console.log(",asdk;jlvbdslkBV;JKSDBV;skj", msg, time, usr);
  messages.innerHTML += `<li class="othersMessage"><span class="username">${usr}: </span>${msg}<time>${new Date(time).toLocaleString("en-US").replace(/,/g, "")}</time></li>`;
  messages.scrollTop = messages.scrollHeight;
});
