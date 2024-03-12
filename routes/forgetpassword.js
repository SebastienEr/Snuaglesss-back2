const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const uid2 = require('uid2');
const User = require('../models/users');

router.post('/forgetpassword', (req, res, next) => { // Route pour modifier le mot de passe apres avoir recus l'email de reinitialisation, la route se lance au moment du clique sur le bouton 
  const { token, newPassword } = req.body;           
                                                     
  User.findOne({ token: token })  // La méthode findOne recherche un utilisateur dans la base de données 
                                  // en fonction d'un jeton donné, puis met à jour son mot de passe et génère un nouveau jeton,
    .then(user => {               //  avant de sauvegarder les modifications.
      if (!user) {
        return res.status(500).send("Aucun utilisateur trouvé.");
      }

      bcrypt.hash(newPassword, 10)
        .then(hash => {
          user.password = hash;
          user.token = uid2(32);

          user.save()
            .then(() => {
              res.send("Mot de passe mis à jour avec succès.");
            })
            .catch(saveErr => {
              console.error(saveErr.toString());
              res.status(500).send("Erreur lors de l'enregistrement du nouveau mot de passe.");
            });
        })
        .catch(hashErr => {
          console.error(hashErr.toString());
          res.status(500).send("Erreur lors du hachage du mot de passe.");
        });
    })
    .catch(err => {
      console.error(err.toString());
      res.status(500).send("Une erreur s'est produite lors de la réinitialisation du mot de passe.");
    });
});

module.exports = router;