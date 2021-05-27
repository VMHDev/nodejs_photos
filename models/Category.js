const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  registered_date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('category', categorySchema);
