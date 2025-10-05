const questionService = require('../services/questionService');
const { handleAsync, sendSuccess, sendError, isValidObjectId } = require('../utils/helpers');

const questionController = {
  // Create question
  createQuestion: handleAsync(async (req, res) => {
    const question = await questionService.createQuestion(req.body);
    sendSuccess(res, question, 201, 'Question created successfully');
  }),

  // Get questions by quiz ID
  getQuestionsByQuiz: handleAsync(async (req, res) => {
    const { quizId } = req.params;
    const { includeAnswers = false } = req.query;
    
    if (!isValidObjectId(quizId)) {
      return sendError(res, 'Invalid quiz ID format', 400);
    }
    
    const questions = await questionService.getQuestionsByQuiz(quizId, includeAnswers === 'true');
    
    sendSuccess(res, questions, 200, 'Questions retrieved successfully');
  }),

  // Submit quiz answers
  submitQuizAnswers: handleAsync(async (req, res) => {
    const { quizId } = req.params;
    const { answers } = req.body;
    
    if (!isValidObjectId(quizId)) {
      return sendError(res, 'Invalid quiz ID format', 400);
    }
    
    if (!Array.isArray(answers)) {
      return sendError(res, 'Answers array is required', 400);
    }
    
    const result = await questionService.submitQuizAnswers(quizId, answers);
    
    sendSuccess(res, result, 200, 'Quiz submitted successfully');
  }),

  // Get question by ID
  getQuestionById: handleAsync(async (req, res) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return sendError(res, 'Invalid question ID format', 400);
    }
    
    const question = await questionService.getQuestionById(id);
    
    if (!question) {
      return sendError(res, 'Question not found', 404);
    }
    
    sendSuccess(res, question, 200, 'Question retrieved successfully');
  }),

};

module.exports = questionController;
