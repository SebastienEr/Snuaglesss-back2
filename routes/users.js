var express = require('express');
var router = express.Router();




require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');



router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['email', 'username', 'password'])) {  
    res.json({ result: false, error: 'Champs manquants ou vides' });
    return;
  }

  // Check if the user has not already been registered
  User.findOne({ username: req.body.username }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        email: req.body.email,
        username: req.body.username,
        password: hash,
        isAdmin: req.body.isAdmin,
        isVerified: req.body.isVerified,

        token: uid2(32),
      });

      newUser.save().then(newDoc => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      
      res.json({ result: false, error: "L'utilisateur existe déjà" });
    }
  });
});

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Champs manquants ou vides' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'Utilisateur introuvable ou mot de passe erroné' });
    }
  });
});

router.delete('/deleteUser', (req, res) => {
  const userEmail = req.body.email; 

  // Retire l'utilisateur de la bdd
  User.findOneAndDelete({ email: userEmail })
    .then(doc => {
      if (!doc) {
        res.json({ result: false, error: 'Utilisateur introuvable' });
      } else {
        res.json({ result: true, message: 'Utilisateur supprimé avec succès' });
      }
    })
    .catch(err => {
      res.json({ result: false, error: 'Erreur lors de la suppression de l\'utilisateur' });
    });
});













module.exports = router;

