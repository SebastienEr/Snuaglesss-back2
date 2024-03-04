const mongoose = require('mongoose');


const dbURL = 'mongodb+srv://admin2:KAWABUNGA@cluster0.nu2rhsw.mongodb.net/snuagless-radio';




mongoose.connect(dbURL,)
  .then(() => {
    console.log('Connexion à la base de données réussie');
  })
  .catch((err) => {
    console.error('Erreur de connexion à la base de données :', err);
  });


module.exports = mongoose.connection;