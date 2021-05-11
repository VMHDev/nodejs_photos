const express = require('express');
const connectDB = require('./config/db');

// Start app
const app = express();

//Connect database
connectDB();

app.get('/', function (req, res) {
  res.json({
    message: 'Welcome to NodeJS',
  });
});

const PORT = process.env.PORT || 7777;
app.listen(PORT, function () {
  console.log(`NodeJS api is running at http://localhost:${PORT}`);
});
