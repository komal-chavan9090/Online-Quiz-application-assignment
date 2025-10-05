const quizService = require('../services/quizService');
const { handleAsync, sendSuccess, sendError, isValidObjectId } = require('../utils/helpers');

const quizController = {
  // Get all quizzes with performance optimization
  getAllQuizzes: handleAsync(async (req, res) => {
    const {
      page = 1,
      limit = 50,
      fields,
      sort
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      fields,
      sort: sort ? JSON.parse(sort) : undefined
    };

    const quizzes = await quizService.getAllQuizzes(options);
    
    sendSuccess(res, quizzes, 200, 'Quizzes retrieved successfully');
  }),

  // Get quiz by ID
  getQuizById: handleAsync(async (req, res) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return sendError(res, 'Invalid quiz ID format', 400);
    }
    
    const quiz = await quizService.getQuizById(id);
    
    sendSuccess(res, quiz, 200, 'Quiz retrieved successfully');
  }),

  // Create quiz
  createQuiz: handleAsync(async (req, res) => {
    const quiz = await quizService.createQuiz(req.body);
    
    sendSuccess(res, quiz, 201, 'Quiz created successfully');
  }),

};

module.exports = quizController;
