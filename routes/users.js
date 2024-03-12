var express = require("express");
var router = express.Router();

require("../models/connection");
require("dotenv").config(); 

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



router.post("/signup", (req, res) => {                                  //Permet l'inscription d'utilisateurs en vérifiant les champs requis, 
  if (!checkBody({ ...req.body }, ["email", "username", "password"])) { //créant un nouvel utilisateur dans la base de données, envoyant un e-mail de vérification
    res.json({ result: false, error: "Champs manquants ou vides" });    //et renvoyant un token d'authentification en cas de succès.
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

router.get("/verify-email", (req, res) => { // Vérifie l'e-mail de l'utilisateur à partir d'un lien de vérification,
  const { token } = req.query;              // mettant à jour son statut de vérification dans la base de données et renvoyant un message de succès.

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

router.post("/signin", (req, res) => {                  // Gère la connexion des utilisateurs en vérifiant les informations d'identification 
  if (!checkBody(req.body, ["username", "password"])) { //et renvoyant un token d'authentification en cas de succès.
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

router.delete("/deleteUser", (req, res) => {  // Supprime un utilisateur de la base de données en utilisant son token de vérification.
  // Retire l'utilisateur de la bdd
  console.log(req.body.token);
  User.findOneAndDelete({ verificationToken: req.body.token }).then((doc) => {
    console.log(doc);
    {
      res.json({ result: true, message: "Utilisateur supprimé avec succès" });
    }
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



// Route post reset-password = mecanique d'envoie de mail
router.post('/reset-password', (req, res) => { // route pour envoyer le mail contenant le lien pour reinitialiser son mdp, se declanche au moment du clique sur le bouton"Envoyer le lien de reinitialisation" sur la page connextion apres ouverture de la modal".//
  const { email } = req.body;                  //Gère l'envoi d'un e-mail de réinitialisation de mot de passe en recherchant l'utilisateur par e-mail et envoyant un e-mail de réinitialisation avec un lien, le cas échéant.

  if (!email) {
    return res.status(400).send('Email requis');
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(404).send('Utilisateur non trouvé');
      }

     
      const userToken = user.token; 

      return sendPasswordChangeEmail(email, userToken)
        .then(() => {
          console.log('E-mail envoyé avec succès');
          res.status(200).send('E-mail de réinitialisation envoyé avec succès.');
        })
        .catch((error) => {
          console.error('Erreur lors de l\'envoi de l\'e-mail:', error.toString());
          res.status(500).send('Erreur lors de l\'envoi de l\'e-mail.');
        });
    })
    .catch(err => {
      console.error('Erreur lors de la recherche de l\'utilisateur:', err);
      res.status(500).send('Erreur lors de la recherche de l\'utilisateur');
    });
});



function sendPasswordChangeEmail(email, token) {
  const passwordChangeUrl = `http://localhost:3001/ResetPasswordPageWrapped?token=${token}`;

  const msg = {
    to: email,
    from: 'radio@snuagless.com', 
    subject: 'Réinitialisation de mot de passe',
    text: 'Voici votre e-mail de réinitialisation de mot de passe.',
    html: `<p>Cliquez sur ce lien pour changer votre mot de passe : <a href="${passwordChangeUrl}">${passwordChangeUrl}</a></p>`,
  };

  return sgMail.send(msg);
}








module.exports = router;
