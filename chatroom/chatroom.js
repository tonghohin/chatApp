const socket = io();
const messages = document.querySelector("#messages");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const youAreLoggedInAs = document.querySelector("#youAreLoggedInAs");
const listIcon = document.querySelector("#listIcon");
const userlist = document.querySelector(".userlist");

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
  messages.innerHTML += `<li class="othersMessage"><span class="username">${usr}: </span>${msg}<time>${time.toLocaleString("en-US").replace(/,/g, "")}</time></li>`;
  messages.scrollTop = messages.scrollHeight;
});

listIcon.addEventListener("click", () => {
  userlist.classList.toggle("appear");
  userlist.innerHTML = "<li>Online Users</li>";

  if (userlist.classList.contains("appear")) {
    fetch("/getUserList")
      .then((res) => res.json())
      .then((data) => {
        for (const user of data) {
          userlist.innerHTML += `
          <li>${user.USERNAME}</li>`;
        }
      });
  }
});

console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
