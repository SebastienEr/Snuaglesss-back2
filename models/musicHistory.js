const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const musicHistorySchema = mongoose.Schema({
  favoriteBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User' 
  }],
  name: String,
  nbLike: Number
});

const MusicHistory = mongoose.model('musichistory', musicHistorySchema);

module.exports = MusicHistory;
