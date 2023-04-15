const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config({ path: './config.env' });

const app = express();

// Connect Database
connectDB();

// Init Middlware
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/auth', require('./routes/api/auth'));

app.get('/', function (req, res) {
  res.send('API Running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, function () {
  console.log(`Server started on port ${PORT}`);
});
