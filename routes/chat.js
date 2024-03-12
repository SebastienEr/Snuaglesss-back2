var express = require("express");
var router = express.Router();
require("../models/connection");
const User = require("../models/users");
const Message = require("../models/messages");

const Pusher = require("pusher");

const pusherConfig = require("../pusher.json"); // (1)
const pusherClient = new Pusher(pusherConfig);

router.put("/:name", function (req, res) {
  // (3)
  console.log("User joined: " + req.params.name);

  pusherClient.trigger("chat_channel", "join", {
    name: req.params.name,
  });
  res.sendStatus(204);
});

router.delete("/:name", function (req, res) {
  // (4)
  console.log("User left: " + req.params.name);
  pusherClient.trigger("chat_channel", "part", {
    name: req.params.name,
  });
  res.sendStatus(204);
});

router.post("/:name/messages", async function (req, res) {
  // (5)
  console.log("User " + req.params.name + " sent message: " + req.body.message);
  pusherClient.trigger("chat_channel", "message", {
    name: req.params.name,
    text: req.body.text,
    time: req.body.time,
    image: req.body.image,
    token: req.body.token,
  });
  console.log(req.body.token);
  const user = await User.findOne({ token: req.body.token });
  console.log(user);
  new Message({
    text: req.body.text,
    user: user._id,
    time: req.body.time,
  }).save();
  res.sendStatus(204);
});

router.get("/messages/:username", async (req, res) => {
  const { username } = req.params;
  const messages = await Message.find().populate({
    path: "user",
    select: "username profilePic",
  });

  console.log(`Fetching messages for ${username}...`);
  console.log(messages);
  if (!messages.length > 0) {
    pusherClient.trigger("chat_channel", "join", {
      messages,
      username,
    });
  } else {
    pusherClient.trigger("chat_channel", "join", {
      messages: [],
    });
  }

  return res.json({ messages, username });
});

module.exports = router;
