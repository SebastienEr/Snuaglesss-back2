const express = require('express');
const router = express.Router();
const MusicHistory = require('./models/MusicHistory');

// Route pour récupérer les utilisateurs qui ont aimé une musique spécifique
router.get('/music/:id/users', (req, res) => {
  const musicId = req.params.id;

  // Recherche de la musique dans la base de données
  MusicHistory.findById(musicId)
    .populate('favoriteBy')
    .then(music => {
      if (!music) {
        return res.status(404).json({ message: 'Musique non trouvée' });
      }

      // Récupérer les utilisateurs qui ont aimé cette musique
      const usersWhoLiked = music.favoriteBy;

      res.status(200).json({ users: usersWhoLiked });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur' });
    });
});

module.exports = router;
