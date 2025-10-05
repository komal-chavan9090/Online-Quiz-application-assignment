const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const quizRoutes = require('./routes/quizRoutes');
const questionRoutes = require('./routes/questionRoutes');

const app = express();

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;