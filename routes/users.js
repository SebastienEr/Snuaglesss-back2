var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/users");
// const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(
  "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"
);

function checkBody(body, fields) {
  return fields.every((field) => body.hasOwnProperty(field) && body[field]);
}

const sendVerificationEmail = (email, token) => {
  const verificationUrl = `http://localhost:3001/VerifPageWrapper?token=${token}`;

  const msg = {
    to: email,
    from: "radio@snuagless.com",
    subject: "Vérification de votre adresse email",
    html: `<p>Cliquez sur ce lien pour vérifier votre adresse email : <a href="${verificationUrl}">${verificationUrl}</a></p>`,
  };

  sgMail
    .send(msg)
    .then(() => console.log("Email de vérification envoyé"))
    .catch((error) => console.error(error.toString()));
};

const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const uniqid = require("uniqid");

require("dotenv").config(); // Make sure to add this line at the top of your file

router.post("/signup", (req, res) => {
  if (!checkBody({ ...req.body }, ["email", "username", "password"])) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }

  User.findOne({ username: req.body.username })
    .then((data) => {
      if (data === null) {
        const hash = bcrypt.hashSync(req.body.password, 10);
        const verificationToken = uid2(32);
        const newUser = new User({
          email: req.body.email,
          username: req.body.username,
          password: hash,
          isAdmin: req.body.isAdmin,
          isVerified: req.body.isVerified,
          isBanned: req.body.isBanned,
          image: null,
          token: uid2(32),
          isAdmin: false,
          isVerified: false,
          isBanned: false,
          verificationToken: verificationToken,
        });

        newUser.save().then((newDoc) => {
          sendVerificationEmail(req.body.email, verificationToken);
          res.json({ result: true, token: newDoc.token });
        });
      } else {
        res.json({ result: false, error: "L'utilisateur existe déjà" });
      }
    })
    .catch((error) => {
      res.status(500).json({ result: false, error: error.message });
    });
});

router.get("/verify-email", (req, res) => {
  const { token } = req.query;

  User.findOne({ verificationToken: token })
    .then((user) => {
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Token invalide ou expiré." });
      }
      user.IsVerified = true;
      return user.save();
    })
    .then((user) => {
      res.json({
        success: true,
        username: user.username,
        message: "Email vérifié avec succès.",
      });
    })
    .catch((error) => {
      res.status(500).json({ success: false, message: "Erreur du serveur." });
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
