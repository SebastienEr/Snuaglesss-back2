var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/users");

router.delete('/banuser', (req, res) => {
    const userUsername = req.body.username; 
  
    // Met à jour le champ isBanned à true pour l'utilisateur spécifié
    User.findOneAndUpdate({ username: userUsername }, { isBanned: true }, { new: true })
      .then(user => {
        if (!user) {
          res.json({ result: false, error: 'Utilisateur introuvable' });
        } else {
          
          if (user.token) {
            user.token = undefined; 
            user.save(); 
          }
          res.json({ result: true, message: 'Utilisateur banni avec succès' });
          
        }
      })
      .catch(err => {
        res.json({ result: false, error: 'Erreur lors du bannisement de l\'utilisateur' });
      });
});

  
module.exports = router;
