const socket = io();
const loginBoxContainer = document.querySelector("#loginBoxContainer");
const loginForm = document.querySelector("#loginForm");
const usernameLogin = document.querySelector("#usernameLogin");
const passwordLogin = document.querySelector("#passwordLogin");
const invalidUsernameOrPassword = document.querySelector("#invalidUsernameOrPassword");

socket.on("checkLoginUsernameAndPassword", (usr, matchedUsernameAndPassword) => {
  if (matchedUsernameAndPassword) {
    sessionStorage.setItem("username", usr);
    // window.location.href = "chatroom.html";
  } else {
    invalidUsernameOrPassword.style["display"] = "block";
  }
});
