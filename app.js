const express = require('express');
const connectDB = require('./config/db');
const users = require('./routes/users');

// Start app
const app = express();

//Connect database
connectDB();

app.get('/', function (req, res) {
  res.json({
    message: 'Welcome to NodeJS',
  });
});

//Use route
app.use('/users', users);

const PORT = process.env.PORT || 7777;
app.listen(PORT, function () {
  console.log(`NodeJS api is running at http://localhost:${PORT}`);
});
