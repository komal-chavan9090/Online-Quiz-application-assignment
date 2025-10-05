const mongoose = require("mongoose");
const { sendError } = require('../utils/helpers');

const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(error => error.message);
    return sendError(res, messages.join(', '), 400);
  }

 
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, 'Invalid ID format', 400);
  }

  // Custom application errors
  if (err.isOperational) {
    return sendError(res, err.message, err.statusCode || 400);
  }

  // Default error response
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong!' 
    : err.message || 'Internal server error';
  
  const statusCode = err.statusCode || 500;
  
  sendError(res, message, statusCode, process.env.NODE_ENV !== 'production' ? err.stack : null);
};

module.exports = errorHandler;
