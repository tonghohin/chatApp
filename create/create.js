const socket = io();
const createAccountForm = document.querySelector("#createAccountForm");
const createUsername = document.querySelector("#createUsername");
const createPassword = document.querySelector("#createPassword");
const usernameTaken = document.querySelector("#usernameTaken");

socket.on("usernameAvailable", (usernameAvailable) => {
  if (usernameAvailable) {
    window.location.href = "/index.html";
  } else {
    usernameTaken.style["display"] = "block";
  }
});
