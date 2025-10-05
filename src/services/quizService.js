const Quiz = require('../models/Quiz');

class QuizService {

  async getAllQuizzes(options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        fields = 'title numberOfQuestions isActive createdAt',
        sort = { createdAt: -1 }
      } = options;

      const query = Quiz.find({ isActive: true })
        .select(fields)
        .sort(sort)
        .lean(); 

      if (limit > 0) {
        const skip = (page - 1) * limit;
        query.skip(skip).limit(limit);
      }

      const quizzes = await query;
      
      return quizzes.map(quiz => ({
        id: quiz._id.toString(),
        title: quiz.title,
        numberOfQuestions: quiz.numberOfQuestions,
        isActive: quiz.isActive,
        createdAt: quiz.createdAt
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  }

 
  async getQuizById(quizId) {
    try {
      const quiz = await Quiz.findById(quizId)
        .select('title numberOfQuestions isActive createdAt updatedAt')
        .lean();
      
      if (!quiz) {
        throw new Error('Quiz not found');
      }
      
      return {
        id: quiz._id.toString(),
        title: quiz.title,
        numberOfQuestions: quiz.numberOfQuestions,
        isActive: quiz.isActive,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  
  async createQuiz(quizData) {
    try {
      const { title, numberOfQuestions, description } = quizData;
      
      if (!title || title.trim().length === 0) {
        throw new Error('Title is required');
      }
      
      if (!numberOfQuestions || numberOfQuestions < 1) {
        throw new Error('Number of questions must be at least 1');
      }

      const quiz = new Quiz({
        title: title.trim(),
        numberOfQuestions,
        description: description?.trim() || '',
        isActive: true
      });
      
      await quiz.save();
      
      return {
        id: quiz._id.toString(),
        title: quiz.title,
        numberOfQuestions: quiz.numberOfQuestions,
        description: quiz.description,
        isActive: quiz.isActive,
        createdAt: quiz.createdAt
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

 
  async getQuizStats() {
    try {
      const stats = await Quiz.aggregate([
        {
          $group: {
            _id: null,
            totalQuizzes: { $sum: 1 },
            activeQuizzes: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            },
            avgQuestions: { $avg: '$numberOfQuestions' }
          }
        }
      ]);

      return stats[0] || {
        totalQuizzes: 0,
        activeQuizzes: 0,
        avgQuestions: 0
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new QuizService();
