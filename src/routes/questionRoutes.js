const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { validateQuestionData } = require('../middleware/validation');

router.post(
  '/',
  validateQuestionData,  
  questionController.createQuestion
);


router.get('/quiz/:quizId', questionController.getQuestionsByQuiz);

router.post('/quiz/:quizId/submit', questionController.submitQuizAnswers);

router.get('/:id', questionController.getQuestionById);

module.exports = router;