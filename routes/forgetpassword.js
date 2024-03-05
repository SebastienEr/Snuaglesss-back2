const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');

const router = express.Router();

sgMail.setApiKey('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');

router.use(bodyParser.json());

router.post('/forgetpassword', (req, res) => {
  const { to, templateId, subject  } = req.body; 

  if (!to ) { 

    return res.status(400).json({ error: 'Veuillez fournir tous les champs obligatoires.' });
  }

  const msg = {
    to,
    from: 'radio@snuagless.com', 
    subject: "Demande de réinitialisation de mot de passe", // Définir le sujet ici
    templateId: 'd-2baa9f0e923c419cbc7552d5e432e034',

  };
  

  sgMail.send(msg)
    .then(() => {
      res.status(200).json({ message: 'E-mail envoyé avec succès.' });
    })
    .catch((error) => {
      console.error(error.toString());
      res.status(500).json({ error: "Une erreur s'est produite lors de l'envoi de l'e-mail." });
    });
});

module.exports = router;
