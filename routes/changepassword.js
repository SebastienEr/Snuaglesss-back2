const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/users');

router.post('/changepassword', (req, res) => {
    const { username, newPassword } = req.body;

    // Hacher le nouveau mot de passe
    bcrypt.hash(newPassword, 10)
        .then(hashedPassword => {
            // Mettre à jour le mot de passe de l'utilisateur dans la base de données
            return User.findOneAndUpdate({ username: username }, { password: hashedPassword });
        })
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé.' });
            }
            return res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe.' });
        });
});

module.exports = router;
