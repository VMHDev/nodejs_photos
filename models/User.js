const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  refresh_token: {
    type: String,
  },
  registered_date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('user', userSchema);
