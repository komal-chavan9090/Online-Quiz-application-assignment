const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = () => {
  const connectionString = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quizdb";
  
  mongoose
    .connect(connectionString)
    .then(() => {
      console.log(" MongoDB Connected");
    })
    .catch((err) => {
      console.log(" Running without database (for demo/testing)");
      console.log(err.message);
      
    });
};

module.exports = connectDB;
