var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("./models/connection");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var chatRouter = require("./routes/chat");
var messageRouter = require("./routes/message");
var sendEmailRouter = require("./routes/email");
var changepassword = require("./routes/changepassword");
var forgetpassword = require("./routes/forgetpassword");

var app = express();
const cors = require("cors");
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
// app.use("/chat", chatRouter);
app.use("/users", usersRouter);
app.use("/message", messageRouter);
app.use("/email", sendEmailRouter);
app.use("/changepassword", changepassword);
app.use("/forgetpassword", forgetpassword);
app.use("/banuser", banuser);

module.exports = app;
