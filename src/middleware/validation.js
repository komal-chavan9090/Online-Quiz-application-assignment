const mongoose = require('mongoose');

const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName} format`
      });
    }
    next();
  };
};

const validateQuizData = (req, res, next) => {
  const errors = [];
  const { title, numberOfQuestions } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required');
  } else if (title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  } else if (title.trim().length > 100) {
    errors.push('Title must be less than 100 characters long');
  }

  if (numberOfQuestions !== undefined) {
    if (typeof numberOfQuestions !== 'number' || numberOfQuestions < 1 || numberOfQuestions > 50) {
      errors.push('Number of questions must be between 1 and 50');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(', ')
    });
  }

  next();
};

const validateQuestionData = (req, res, next) => {
  const errors = [];
  const { question, type, options, answer, quizId, points } = req.body;

  // Validate question
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    errors.push('Question is required');
  } else if (question.trim().length < 5) {
    errors.push('Question must be at least 5 characters long');
  } else if (question.trim().length > 500) {
    errors.push('Question must be less than 500 characters long');
  }

  // Validate question type
  const validTypes = ['multiple-choice', 'single-choice', 'text-based'];
  const questionType = type || 'single-choice';
  
  if (!validTypes.includes(questionType)) {
    errors.push('Question type must be one of: multiple-choice, single-choice, text-based');
  }

  // Validate based on question type
  if (questionType === 'text-based') {
    // Text-based questions
    if (options && options.length > 0) {
      errors.push('Text-based questions should not have options');
    }
    
    if (!answer || typeof answer !== 'string') {
      errors.push('Text-based questions must have a string answer');
    } else if (answer.trim().length === 0) {
      errors.push('Text-based questions cannot have an empty answer');
    } else if (answer.length > 300) {
      errors.push('Text-based answer must be 300 characters or less');
    }
    
  } else {
    // Multiple choice or single choice questions
    if (!options || !Array.isArray(options)) {
      errors.push('Options must be an array for choice-based questions');
    } else if (options.length < 2 || options.length > 6) {
      errors.push('Choice-based questions must have between 2-6 options');
    } else {
      options.forEach((option, index) => {
        if (!option || typeof option !== 'string' || option.trim().length === 0) {
          errors.push(`Option ${index + 1} is required and must be a string`);
        }
      });
    }

    // Validate answer based on type
    if (questionType === 'single-choice') {
      if (!answer || typeof answer !== 'string') {
        errors.push('Single-choice questions must have a string answer');
      } else if (options && Array.isArray(options) && !options.includes(answer)) {
        errors.push('Single-choice answer must be one of the provided options');
      }
    } else if (questionType === 'multiple-choice') {
      if (!answer || !Array.isArray(answer)) {
        errors.push('Multiple-choice questions must have an array of answers');
      } else if (answer.length === 0) {
        errors.push('Multiple-choice questions must have at least one correct answer');
      } else if (options && Array.isArray(options)) {
        const invalidAnswers = answer.filter(ans => !options.includes(ans));
        if (invalidAnswers.length > 0) {
          errors.push('All multiple-choice answers must be from the provided options');
        }
        if (answer.length > options.length) {
          errors.push('Cannot have more answers than options');
        }
      }
    }
  }

  // Validate points
  if (points !== undefined) {
    if (typeof points !== 'number' || points < 1 || points > 10) {
      errors.push('Points must be a number between 1 and 10');
    }
  }

  // Validate quizId if provided
  if (quizId && !mongoose.Types.ObjectId.isValid(quizId)) {
    errors.push('Invalid quiz ID format');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(', ')
    });
  }

  next();
};

module.exports = {
  validateObjectId,
  validateQuizData,
  validateQuestionData
};
