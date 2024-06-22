const express = require('express');
const connectDB = require('./config/db');
const app = express();
const cors = require('cors');

// Connect to the database
connectDB();

// Enable CORS
app.use(cors());

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/users', require('./routes/auth'));
app.use('/api/assets', require('./routes/assets'));

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
