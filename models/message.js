const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  texte: String,
  username: String,
  profilPic: String,
  heure: { type: Date, default: Date.now },
  
  IsReported: {
    type: Boolean,
    default: false,
  },
  

  
});

const Message = mongoose.model('message', messageSchema);

module.exports = Message;