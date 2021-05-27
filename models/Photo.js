const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const photoSchema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: 'category',
  },
  path: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  registered_date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('photo', photoSchema);
