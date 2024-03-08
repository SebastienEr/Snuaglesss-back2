var express = require("express");
var router = express.Router();

require("../models/connection");
const Message = require("../models/messages");

router.post("/message", (req, res) => {
  const { username, texte, heure, profilPic, isReported } = req.body;

  const newMessage = new Message({
    texte,
    username,
    heure,
    profilPic,
    isReported,
  });

  newMessage
    .save()
    .then((savedMessage) => {
      res.status(200).json(savedMessage);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

router.get("/message", (req, res) => {
  Message.find()
    .then((messages) => {
      res.status(200).json(messages);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

module.exports = router;
