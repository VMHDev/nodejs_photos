const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    console.log('Connected database success');
  } catch (error) {
    console.log('Error connect database: ', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
