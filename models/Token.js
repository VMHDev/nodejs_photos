const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  user_id: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  registered_date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('token', userSchema);
