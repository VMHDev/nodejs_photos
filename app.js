require('dotenv').config();
const express = require('express');

const connectDB = require('./config/db');
const userRouter = require('./routes/users');

// Start app
const app = express();
app.use(express.json()); // express accept post body with json

// Connect database
connectDB();

// Use route
app.use('/api/user', userRouter);

// Run
const PORT = process.env.PORT || 3003;
app.listen(PORT, function () {
  console.log(`Server photos api is running on port: ${PORT}`);
});
