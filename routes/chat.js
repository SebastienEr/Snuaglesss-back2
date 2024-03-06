// var express = require("express");
// var router = express.Router();

// const Pusher = require("pusher");

// const pusherConfig = require("../pusher.json"); // (1)
// const pusherClient = new Pusher(pusherConfig);

// router.put("/:name", function (req, res) {
//   // (3)
//   console.log("User joined: " + req.params.name);
//   pusherClient.trigger("chat_channel", "join", {
//     name: req.params.name,
//   });
//   res.sendStatus(204);
// });

// router.delete("/:name", function (req, res) {
//   // (4)
//   console.log("User left: " + req.params.name);
//   pusherClient.trigger("chat_channel", "part", {
//     name: req.params.name,
//   });
//   res.sendStatus(204);
// });

// router.post("/:name/messages", function (req, res) {
//   // (5)
//   console.log("User " + req.params.name + " sent message: " + req.body.message);
//   pusherClient.trigger("chat_channel", "message", {
//     name: req.params.name,
//     message: req.body.message,
//   });
//   res.sendStatus(204);
// });

// module.exports = router;
