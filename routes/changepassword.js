const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/users');

router.post('/changepassword', async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;

    try {
        // Trouver l'utilisateur dans la base de données
        const user = await User.findOne({ username });

        // Vérifier si l'utilisateur existe
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Vérifier si l'ancien mot de passe correspond
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Mot de passe incorrect.' });
        }

        // Vérifier si le nouveau mot de passe respecte les critères
        if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword) || !/[^a-zA-Z0-9]/.test(newPassword)) {
            return res.status(400).json({ message: 'Le nouveau mot de passe doit avoir au moins 8 caractères, une majuscule, un chiffre et un symbole.' });
        }

        // Hacher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe de l'utilisateur dans la base de données
        await User.findOneAndUpdate({ username }, { password: hashedPassword });

        return res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe.' });
    }
});


router.post('/changeusername', async (req, res) => {
    const { Username, newUsername } = req.body;

    try {
        // Vérifier si le nouvel username est déjà utilisé
        const existingUser = await User.findOne({ username: newUsername });
        if (existingUser) {
            return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà utilisé.' });
        }

        // Mettre à jour le nom d'utilisateur de l'utilisateur dans la base de données
        await User.findOneAndUpdate({ username: Username }, { username: newUsername });

        return res.status(200).json({ message: 'Nom d\'utilisateur mis à jour avec succès.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du nom d\'utilisateur.' });
    }
});


















module.exports = router;
