const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const uid2 = require('uid2');
const User = require('../models/users'); 

router.post('/forgetpassword', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(500).send("Erreur lors de la recherche de l'utilisateur.");
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    user.token = uid2(32); 

    await user.save();
    res.send("Mot de passe mis à jour avec succès.");
  } catch (error) {
    console.error(error.toString());
    res.status(500).send("Une erreur s'est produite lors de la réinitialisation du mot de passe.");
  }
});

module.exports = router;
