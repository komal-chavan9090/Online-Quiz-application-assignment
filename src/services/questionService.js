const Question = require('../models/Question');
const quizService = require('./quizService');

class QuestionService {
  async createQuestion(questionData) {
    try {
      const { question, type, options, answer, quizId, points } = questionData;
      
      // Validate quiz exists if quizId is provided
      if (quizId) {
        await quizService.getQuizById(quizId);
      }
      
      const newQuestion = new Question({
        question: question.trim(),
        type: type || 'single-choice',
        options: options || [],
        answer: typeof answer === 'string' ? answer.trim() : answer,
        quizId,
        points: points || 1
      });
      
      await newQuestion.save();
      return newQuestion.toPublicJSON();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  
  async getQuestionsByQuiz(quizId, includeAnswers = false) {
    try {
      const questions = await Question.findByQuiz(quizId, includeAnswers);
      return questions;
    } catch (error) {
      throw new Error(error.message);
    }
  }

 
  async getQuestionById(questionId) {
    try {
      const question = await Question.findById(questionId);
      return question ? question.toPublicJSON() : null;
    } catch (error) {
      throw new Error(error.message);
    }
  }

 
  async submitQuizAnswers(quizId, answers) {
    try {
      if (!Array.isArray(answers) || answers.length === 0) {
        throw new Error("Answers are required");
      }

      let score = 0;
      const totalQuestions = answers.length;

      for (const answer of answers) {
        const { questionId, selectedOptionId, selectedOptionIds, textAnswer } = answer;
        
        if (!questionId) {
          throw new Error("Each answer must have questionId");
        }

        const question = await Question.findById(questionId);

        if (!question) {
          throw new Error(`Question not found: ${questionId}`);
        }

        if (question.quizId.toString() !== quizId) {
          throw new Error(`Question ${questionId} does not belong to quiz ${quizId}`);
        }

        let isCorrect = false;
        let userAnswer = null;

        if (question.type === 'text-based') {
          if (textAnswer === undefined || textAnswer === null) {
            throw new Error(`Text answer required for question ${questionId}`);
          }
          userAnswer = textAnswer;
          isCorrect = question.answer.toLowerCase().trim() === textAnswer.toLowerCase().trim();
          
        } else if (question.type === 'single-choice') {
          if (selectedOptionId === undefined || selectedOptionId === null) {
            throw new Error(`Selected option ID required for question ${questionId}`);
          }
          
          if (selectedOptionId < 0 || selectedOptionId >= question.options.length) {
            throw new Error(`Invalid option index ${selectedOptionId} for question ${questionId}`);
          }
          
          userAnswer = question.options[selectedOptionId];
          isCorrect = question.answer === userAnswer;
          
        } else if (question.type === 'multiple-choice') {
          if (!selectedOptionIds || !Array.isArray(selectedOptionIds)) {
            throw new Error(`Selected option IDs array required for question ${questionId}`);
          }
          
          userAnswer = selectedOptionIds.map(id => {
            if (id < 0 || id >= question.options.length) {
              throw new Error(`Invalid option index ${id} for question ${questionId}`);
            }
            return question.options[id];
          });
          
          const correctAnswers = Array.isArray(question.answer) ? question.answer : [question.answer];
          isCorrect = userAnswer.length === correctAnswers.length && 
                     userAnswer.every(ans => correctAnswers.includes(ans));
        } else {
          if (selectedOptionId === undefined || selectedOptionId === null) {
            throw new Error(`Selected option ID required for question ${questionId}`);
          }
          
          if (selectedOptionId < 0 || selectedOptionId >= question.options.length) {
            throw new Error(`Invalid option index ${selectedOptionId} for question ${questionId}`);
          }
          
          userAnswer = question.options[selectedOptionId];
          isCorrect = question.answer === userAnswer;
        }

        if (isCorrect) {
          score++;
        }
      }

      return {
        score,
        total: totalQuestions
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

 
  async addQuestion(quizId, questionData) {
    // Validate quiz exists
    await quizService.getQuizById(quizId);
    
    const { text, options } = questionData;
    
    this.validateQuestionData({ text, options });
    
    const question = new Question({
      quizId,
      text: text.trim(),
      options: options.map(option => ({
        text: option.text.trim(),
        isCorrect: Boolean(option.isCorrect)
      }))
    });
    
    return await question.save();
  }

 
  async getQuizQuestions(quizId, includeAnswers = false) {
    await quizService.getQuizById(quizId);
    
    let query = Question.find({ quizId });
    
    if (!includeAnswers) {
      query = query.select("-options.isCorrect");
    }
    
    return await query.sort({ createdAt: 1 });
  }

 
  validateQuestionData({ text, options }) {
    if (!text || text.trim().length === 0) {
      throw new Error("Question text is required");
    }

    if (!Array.isArray(options) || options.length < 2) {
      throw new Error("At least 2 options are required");
    }

    const correctAnswers = options.filter(option => option.isCorrect);
    if (correctAnswers.length !== 1) {
      throw new Error("Exactly one correct answer is required");
    }

    for (const option of options) {
      if (!option.text || option.text.trim().length === 0) {
        throw new Error("All options must have text");
      }
    }
  }
}

module.exports = new QuestionService();