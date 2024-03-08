const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  text: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  // time: { type: Date, default: Date.now },
  time: String,

  IsReported: {
    type: Boolean,
    default: false,
  },
});

const Message = mongoose.model("messages", messageSchema);

module.exports = Message;
