require("dotenv").config(); // Make sure to add this line at the top of your file
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

cloudinary.config({
  cloud_name: "dib0gfrt9",
  api_key: "674822684777143",
  api_secret: "7nlIX1uV-b3kewhaKZmfbBb-RkM",
});

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
      res.json({ result: true, token: user.token, user });
    } else {
      res.json({ result: false, error: "Mot de passe incorrect" });
    }
  });
});

router.delete("/deleteUser", (req, res) => {
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

  try {
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
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

// const handleResetPassword = (e) => {
//   e.preventDefault();
//   const email = getEmailFromSomeInput();
//   const token = generateToken();

//   fetch('/reset-password', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ email, token }),
//   })
//     .then(response => {
//       if (response.ok) {
//         router.push('/ResetPasswordPageWrapped');
//       } else {
//         return response.text().then(errorMessage => {
//           throw new Error(errorMessage);
//         });
//       }
//     })
//     .catch(error => {
//       console.error('Erreur lors de l\'envoi de l\'e-mail:', error.toString());
//     });
// };

// Route post reset-password = mecanique d'envoie de mail
router.post("/reset-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send("Email requis");
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(404).send("Utilisateur non trouvé");
      }

      const userToken = user.token;

      return sendPasswordChangeEmail(email, userToken)
        .then(() => {
          console.log("E-mail envoyé avec succès");
          res
            .status(200)
            .send("E-mail de réinitialisation envoyé avec succès.");
        })
        .catch((error) => {
          console.error(
            "Erreur lors de l'envoi de l'e-mail:",
            error.toString()
          );
          res.status(500).send("Erreur lors de l'envoi de l'e-mail.");
        });
    })
    .catch((err) => {
      console.error("Erreur lors de la recherche de l'utilisateur:", err);
      res.status(500).send("Erreur lors de la recherche de l'utilisateur");
    });
});

function sendPasswordChangeEmail(email, token) {
  const passwordChangeUrl = `http://localhost:3001/ResetPasswordPageWrapped?token=${token}`;

  const msg = {
    to: email,
    from: "radio@snuagless.com",
    subject: "Réinitialisation de mot de passe",
    text: "Voici votre e-mail de réinitialisation de mot de passe.",
    html: `<p>Cliquez sur ce lien pour changer votre mot de passe : <a href="${passwordChangeUrl}">${passwordChangeUrl}</a></p>`,
  };

  return sgMail.send(msg);
}

module.exports = router;
