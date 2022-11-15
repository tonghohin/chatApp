const socket = io();
const messages = document.querySelector("#messages");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const youAreLoggedInAs = document.querySelector("#youAreLoggedInAs");
const listIcon = document.querySelector("#listIcon");
const userlist = document.querySelector(".userlist");

const USER_LIST = [];

fetch("/preivouschats")
  .then((res) => res.json())
  .then((data) => {
    for (const chatObject of data.previouschats) {
      if (chatObject.username === data.username) {
        messages.innerHTML += displayChat(chatObject.chat, chatObject.timestamp, false);
        messages.scrollTop = messages.scrollHeight;
      } else {
        messages.innerHTML += displayChat(chatObject.chat, chatObject.timestamp, true, chatObject.username);
        messages.scrollTop = messages.scrollHeight;
      }
    }
  });

fetch("/userList")
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    for (const userObject of data.userlist) {
      USER_LIST.push(userObject.USERNAME);
    }
  });

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const time = new Date().toISOString();
  if (chatInput.value) {
    console.log(time);
    socket.emit("chatMessage", chatInput.value, time);
    messages.innerHTML += displayChat(chatInput.value, time, false);
    messages.scrollTop = messages.scrollHeight;
    chatForm.reset();
  }
});

listIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  userlist.classList.toggle("appear");

  if (userlist.classList.contains("appear")) {
    fetch("/userList")
      .then((res) => res.json())
      .then((data) => {
        userlist.innerHTML = `
        <li>Online Users</li>
        <li>${data.username} (You)</li>`;
        for (const userObject of data.userlist) {
          if (userObject.USERNAME === data.username) {
            continue;
          }
          userlist.innerHTML += `<li>${userObject.USERNAME}</li>`;
        }
      });
    document.documentElement.addEventListener("click", () => {
      userlist.classList.remove("appear");
    });
  }
});

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
  messages.innerHTML += displayChat(msg, time, true, usr);
  messages.scrollTop = messages.scrollHeight;
});

function displayChat(chat, time, othersmessage, username = "You") {
  const regex = new RegExp(/(([\w]+:)?\/\/)?(([\d\w]|%[a-fA-f\d]{2,2})+(:([\d\w]|%[a-fA-f\d]{2,2})+)?@)?([\d\w][-\d\w]{0,253}[\d\w]\.)+[\w]{2,63}(:[\d]+)?(\/([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)*(\?(&?([-+_~.\d\w]|%[a-fA-f\d]{2,2})=?)*)?(#([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)?/, "gi");
  const matchURL = chat.match(regex);

  if (matchURL) {
    for (const URL of matchURL) {
      if (URL.toLowerCase().startsWith("https://") || URL.toLowerCase().startsWith("http://")) {
        chat = chat.replace(URL, `<a href="${URL}" target="_blank">${URL}</a>`);
      } else {
        chat = chat.replace(URL, `<a href="//${URL}" target="_blank">${URL}</a>`);
      }
    }
  }

  if (othersmessage) {
    return `<li class="othersMessage"><span class="username">${username}: </span>${chat}<time>${new Date(time).toLocaleString("en-US").replace(/,/g, "")}</time></li>`;
  } else {
    return `<li class="ownMessage"><span class="username">${username}: </span>${chat}<time>${new Date(time).toLocaleString("en-US").replace(/,/g, "")}</time></li>`;
  }
}
