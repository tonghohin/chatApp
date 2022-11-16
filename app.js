require("dotenv").config();
const fs = require("fs");
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
const sessionMiddleware = session({ secret: "secret", resave: false, saveUninitialized: true });

server.listen(process.env.PORT || 3000, () => {
  console.log("SERVER LISTENING!");
});

app.set("view engine", "ejs");
app.use(express.static(__dirname));
app.use(sessionMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

// Connect to MySQL database
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  charset: "utf8mb4",
  port: process.env.MYSQL_PORT,
  ssl: { ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem") }
});

// Connect to test database
// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "password",
//   database: "Yellowchat",
//   charset: "utf8mb4"
// });

connection.connect((err) => {
  if (err) {
    return console.error("Error: ", err.message);
  }
  console.log("CONNECTED TO MYSQL SERVER");
  connection.query("SELECT * FROM users", (err, result) => {
    console.log("DATABASE RESULT", result);
  });
});

const CURRENT_USERS = [];

passport.serializeUser((user, done) => {
  CURRENT_USERS.push({ USER_ID: user[0].user_id, USERNAME: user[0].username });
  done(null, user[0].user_id);
  console.log("LIST", CURRENT_USERS);
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
  res.render("index", { username: getUserName(req.session.passport.user), userlist: CURRENT_USERS });
});

app.get("/userList", (req, res) => {
  res.json({ username: getUserName(req.session.passport.user), userlist: CURRENT_USERS });
});

app.get("/preivouschats", (req, res) => {
  console.log("fetchs");
  connection.query("SELECT ca.chat, ca.user_id, ca.timestamp, u.username FROM chat_archive ca JOIN users u ON ca.user_id = u.user_id ORDER BY ca.timestamp", (err, result) => {
    if (err) {
      console.log(err);
    }
    console.log("hihi", result);
    res.json({ previouschats: result, username: getUserName(req.session.passport.user) });
  });
});

app.get("/login", loggedOut, (req, res) => {
  res.render("login", { error: req.query.error });
});

app.get("/create", loggedOut, (req, res) => {
  res.render("create", { error: req.query.error, accountCreated: false });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login?error=true"
  })
);

app.post("/create", (req, res) => {
  const { createUsername, createPassword } = req.body;

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
          connection.query("INSERT INTO users (username, user_password) VALUES (?, ?)", [createUsername, hash], (err) => {
            if (err) {
              console.log("CREATE ACCOUNT ERROR:", err);
            }
            console.log("NEW USER ACCOUNT CREATED");
          });
        });
      });
      res.render("create", { error: false, accountCreated: true });
    } else {
      console.log("Username exists!!!");
      res.redirect("/create?error=true");
    }
  });
});

const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));
io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error("unauthorized"));
  }
});

io.on("connection", (socket) => {
  app.get("/logout", (req, res) => {
    socket.broadcast.emit("someoneLoggedOut", getUserName(req.session.passport.user));

    for (let i = 0; i < CURRENT_USERS.length; i++) {
      if (CURRENT_USERS[i].USER_ID === req.session.passport.user) {
        CURRENT_USERS.splice(i, 1);
      }
    }

    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });

  socket.broadcast.emit("someoneLoggedIn", getUserName(socket.request.session.passport.user));

  socket.on("chatMessage", (msg, time) => {
    console.log(`'${msg}', AT ${time.toString()}`);
    socket.broadcast.emit("chatMessage", msg, time, getUserName(socket.request.session.passport.user));

    connection.query("INSERT INTO chat_archive (chat, user_id, timestamp) VALUES (?, ?, ?)", [msg, socket.request.session.passport.user, time], (err) => {
      if (err) {
        console.log(err);
      }
      console.log("Chat archived");
    });
  });
});

function getUserName(id) {
  for (const userPacket of CURRENT_USERS) {
    if (userPacket.USER_ID === id) {
      return userPacket.USERNAME;
    }
  }
}
