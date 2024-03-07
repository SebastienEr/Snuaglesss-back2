var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const uniqid = require("uniqid");

require("dotenv").config(); // Make sure to add this line at the top of your file

router.post("/signup", (req, res) => {
  if (!checkBody({ ...req.body }, ["email", "username", "password"])) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }

  // Check if the user has not already been registered
  User.findOne({ username: req.body.username }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        email: req.body.email,
        username: req.body.username,
        password: hash,
        isAdmin: req.body.isAdmin,
        isVerified: req.body.isVerified,
        isBanned: req.body.isBanned,
        image: null,
        token: uid2(32),
      });

      newUser.save().then((newDoc) => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      res.json({ result: false, error: "L'utilisateur existe déjà" });
    }
  });
});

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }

  User.findOne({ username: req.body.username }).then((user) => {
    if (!user) {
      res.json({ result: false, error: "Utilisateur introuvable" });
    } else if (user.isBanned) {
      if (user.token) {
        user.token = undefined;
        user.save();
      }
      res.json({ result: false, error: "Cet utilisateur est banni" });
    } else if (bcrypt.compareSync(req.body.password, user.password)) {
      res.json({ result: true, token: user.token });
    } else {
      res.json({ result: false, error: "Mot de passe incorrect" });
    }
  });
});

router.delete("/deleteUser", (req, res) => {
  const userEmail = req.body.email;

  // Retire l'utilisateur de la bdd
  User.findOneAndDelete({ email: userEmail })
    .then((doc) => {
      if (!doc) {
        res.json({ result: false, error: "Utilisateur introuvable" });
      } else {
        res.json({ result: true, message: "Utilisateur supprimé avec succès" });
      }
    })
    .catch((err) => {
      res.json({
        result: false,
        error: "Erreur lors de la suppression de l'utilisateur",
      });
    });
});

router.post("/upload/:token", async (req, res) => {
  const token = req.params.token;
  console.log(req.files);

  if (!req.files || !req.files.image) {
    return res.status(400).json({ result: false, error: "No file uploaded" });
  }
  const photoPath = `./temp/${uniqid()}.jpg`;
  const resultMove = await req.files.image.mv(photoPath);

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    const updatedUser = await User.findOneAndUpdate(
      { token: token },
      { profilePic: resultCloudinary.secure_url },
      { new: true }
    );
    res.json({
      result: true,
      url: resultCloudinary.secure_url,
      user: updatedUser,
    });
  } else {
    res.json({ result: false, error: resultMove });
  }

  fs.unlinkSync(photoPath);
});

module.exports = router;
