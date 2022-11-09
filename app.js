const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const mysql = require("mysql");
const { use } = require("passport");

// Connect to MySQL database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "Yellowchat"
});

connection.connect((err) => {
  if (err) {
    return console.error("Error: ", err.message);
  }
  console.log("CONNECTED TO MYSQL SERVER");
  connection.query("SELECT * FROM users", (err, result) => {
    console.log("RESULT", result);
  });
});

app.set("view engine", "ejs");
app.use(express.static(__dirname));
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

const USER = { USERNAME: null, USERSESSIONID: null };
passport.serializeUser((user, done) => {
  USER.USERNAME = user[0].username;
  done(null, user[0].user_id);
});

passport.deserializeUser((id, done) => {
  connection.query("SELECT * FROM users WHERE user_id = ?", [id], (err, result) => {
    done(err, result[0]);
  });
});

passport.use(
  new LocalStrategy((username, password, done) => {
    connection.query("SELECT * FROM users WHERE username = ?", [username], (err, result) => {
      if (err) {
        return done(err);
      }
      if (result[0] === undefined) {
        return done(null, false, { message: "WRONG USERNAME" });
      }
      bcrypt.compare(password, result[0].user_password, (err, res) => {
        if (err) {
          return done(err);
        }
        if (!res) {
          return done(null, false, { message: "WRONG PWD" });
        }
        return done(null, result);
      });
    });
  })
);

function loggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function loggedOut(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

app.get("/", loggedIn, (req, res) => {
  USER.USERSESSIONID = req.session.id;

  connection.query("SELECT username FROM users WHERE user_id = ?", [req.session.passport.user], (err, result) => {
    if (err) {
      console.log(err);
    }
    res.render("index", { username: result[0].username });
  });
});

app.get("/login", loggedOut, (req, res) => {
  res.render("login");
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login?error=true"
  })
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.post("/create-account", (req, res) => {
  console.log(req.body);
  const { createUsername, createPassword } = req.body;
  console.log(createUsername);
  console.log(createPassword);

  connection.query("SELECT username FROM users WHERE username = ? ", [createUsername], (err, result) => {
    if (err) {
      console.log("CHECK USERNAME EXISTS ERROR:", err);
    }
    if (result[0] === undefined) {
      console.log("Username available!!!");
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return next(err);
        }
        bcrypt.hash(createPassword, salt, (err, hash) => {
          if (err) {
            return next(err);
          }
          const newUserSQL = `INSERT INTO users (username, user_password) VALUES ('${createUsername}','${hash}')`;
          connection.query(newUserSQL, (err) => {
            if (err) {
              console.log("CREATE ACCOUNT ERROR:", err);
            }
            console.log("NEW USER ACCOUNT CREATED");
          });
        });
      });
      res.redirect("/login");
    } else {
      console.log("Username exists!!!");
      res.redirect("/create-account?error=true");
    }
  });
});

// connection.query(`SELECT user_password FROM users WHERE username = ${username}`, (err, results, fields) => {
//   if (err) {
//     return done(err);
//   }

//   if (result[0] !== undefined && result[0].user_password === password) {
//     req.session.loggedin = true;
//     req.session.username = username;
//     req.session.cookie.username = username;
//     console.log(req.session.cookie);
//     res.redirect("./chatroom.html");
//     io.emit("checkLoginUsernameAndPassword", username, true);
//     currentUserList[findSocketID(currentUserList, socket.id)].username = req.body.username;
//     console.log("A USER LOGGED IN:", req.body.username);
//     console.log("CURRENT USERS:", currentUserList);
//   } else if (result[0] !== password) {
//     res.sendFile(__dirname + "/index.html");

//     io.emit("checkLoginUsernameAndPassword", req.body.username, false);
//   }
// });

// app.post("/", (req, res) => {
//   console.log(req.body);
//   const { username, password } = req.body;
// });

io.on("connection", (socket) => {
  console.log("A USER CONNECTED:", socket.id);

  // currentUserList.push({ socketID: socket.id, username: "" });
  // console.log("CURRENT USERS:", currentUserList);

  // socket.on("disconnect", () => {
  //   if (findUsername(currentUserList, socket.id) !== "") {
  //     io.emit("left", findUsername(currentUserList, socket.id));
  //   }
  //   console.log("A USER DISCONNECTED:", socket.id);
  //   currentUserList.splice(findSocketID(currentUserList, socket.id), 1);
  //   console.log("CURRENT USERS:", currentUserList);
  // });

  // socket.on("logout", (usr) => {
  //   console.log(usr, "LEFT!!!!!!!!!");
  // });

  console.log("ID", USER.USERSESSIONID);

  socket.on("logout", (usr) => {
    io.emit("logout", usr);
  });

  socket.on("chatMessage", (msg, time) => {
    console.log(`'${msg}', AT ${time}`);
    io.emit("chatMessage", msg, time, USER.USERNAME);
  });

  // socket.on("login", (usr, pwd) => {
  //   const matchUsernameAndPasswordSQL = `SELECT user_password FROM users WHERE username = '${usr}'`;
  //   connection.query(matchUsernameAndPasswordSQL, (err, result) => {
  //     if (err) {
  //       console.log("LOGIN ERROR:", err);
  //     }
  //     if (result[0] !== undefined && result[0].user_password === pwd) {
  //       io.emit("checkLoginUsernameAndPassword", usr, true);
  //       currentUserList[findSocketID(currentUserList, socket.id)].username = usr;
  //       console.log("A USER LOGGED IN:", usr);
  //       console.log("CURRENT USERS:", currentUserList);
  //     } else if (result[0] !== pwd) {
  //       io.emit("checkLoginUsernameAndPassword", usr, false);
  //     }
  //   });
  // });

  // socket.on("createAccount", (usr, pwd) => {
  //   const findUsernameExistsSQL = `SELECT username FROM users WHERE username = '${usr}'`;
  //   connection.query(findUsernameExistsSQL, (err, result) => {
  //     if (err) {
  //       console.log("CHECK USERNAME EXISTS ERROR:", err);
  //     }
  //     if (result[0] === undefined) {
  //       io.emit("usernameAvailable", true);
  //       const newUserSQL = `INSERT INTO users (username, user_password) VALUES ('${usr}','${pwd}')`;
  //       connection.query(newUserSQL, (err) => {
  //         if (err) {
  //           console.log("CREATE ACCOUNT ERROR:", err);
  //         }
  //         console.log("NEW USER ACCOUNT CREATED");
  //       });
  //     } else {
  //       io.emit("usernameAvailable", false);
  //     }
  //   });
  // });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("SERVER LISTENING!");
});
