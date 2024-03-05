const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');

const router = express.Router();


sgMail.setApiKey('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');


router.use(bodyParser.json());


router.post('/email', (req, res) => {
  const { to, templateId } = req.body;

 
  if (!to ) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

 
  const msg = {
    to,
    from: 'radio@snuagless.com', 
    subject: "Verification de votre adresse mail",
    templateId: 'd-4d6fc1ffa83f4393baf8b8438fe83bdf',
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