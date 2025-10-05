const questionService = require('../../src/services/questionService');
const Question = require('../../src/models/Question');

jest.mock('../../src/models/Question');
jest.mock('../../src/services/quizService', () => ({
  getQuizById: jest.fn()
}));

const quizService = require('../../src/services/quizService');

describe('Question Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuestion', () => {
    it('should create a new question successfully', async () => {
         
      const questionData = {
        question: 'What is 2+2?',
        type: 'single-choice',
        options: ['3', '4', '5'],
        answer: '4',
        quizId: '507f1f77bcf86cd799439011',
        points: 2
      };

      const mockQuiz = { id: '507f1f77bcf86cd799439011', title: 'Test Quiz' };
      const savedQuestion = {
        _id: '507f1f77bcf86cd799439012',
        ...questionData,
        toPublicJSON: jest.fn().mockReturnValue({
          id: '507f1f77bcf86cd799439012',
          ...questionData
        }),
        save: jest.fn().mockResolvedValue(this)
      };

      quizService.getQuizById.mockResolvedValue(mockQuiz);
      Question.mockImplementation(() => savedQuestion);

         
      const result = await questionService.createQuestion(questionData);

         
      expect(quizService.getQuizById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(Question).toHaveBeenCalledWith({
        question: 'What is 2+2?',
        type: 'single-choice',
        options: ['3', '4', '5'],
        answer: '4',
        quizId: '507f1f77bcf86cd799439011',
        points: 2
      });
      expect(savedQuestion.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: '507f1f77bcf86cd799439012',
        ...questionData
      });
    });

    it('should create question with default values when optional fields are missing', async () => {
         
      const questionData = {
        question: '  What is JavaScript?  ',
        answer: '  A programming language  '
      };

      const savedQuestion = {
        _id: '507f1f77bcf86cd799439012',
        question: 'What is JavaScript?',
        type: 'single-choice',
        options: [],
        answer: 'A programming language',
        points: 1,
        toPublicJSON: jest.fn().mockReturnValue({
          id: '507f1f77bcf86cd799439012',
          question: 'What is JavaScript?',
          type: 'single-choice',
          options: [],
          answer: 'A programming language',
          points: 1
        }),
        save: jest.fn().mockResolvedValue(this)
      };

      Question.mockImplementation(() => savedQuestion);

         
      const result = await questionService.createQuestion(questionData);

         
      expect(Question).toHaveBeenCalledWith({
        question: 'What is JavaScript?',
        type: 'single-choice',
        options: [],
        answer: 'A programming language',
        quizId: undefined,
        points: 1
      });
      expect(result.question).toBe('What is JavaScript?');
      expect(result.answer).toBe('A programming language');
    });

    it('should handle array answers correctly', async () => {
         
      const questionData = {
        question: 'Select programming languages',
        type: 'multiple-choice',
        options: ['JavaScript', 'Python', 'Java', 'C++'],
        answer: ['JavaScript', 'Python'],
        quizId: '507f1f77bcf86cd799439011'
      };

      const savedQuestion = {
        _id: '507f1f77bcf86cd799439012',
        ...questionData,
        toPublicJSON: jest.fn().mockReturnValue({
          id: '507f1f77bcf86cd799439012',
          ...questionData
        }),
        save: jest.fn().mockResolvedValue(this)
      };

      quizService.getQuizById.mockResolvedValue({ id: '507f1f77bcf86cd799439011' });
      Question.mockImplementation(() => savedQuestion);

         
      const result = await questionService.createQuestion(questionData);

         
      expect(result.answer).toEqual(['JavaScript', 'Python']);
    });

    it('should throw error when quiz validation fails', async () => {
         
      const questionData = {
        question: 'Test question',
        quizId: 'invalid-quiz-id'
      };

      quizService.getQuizById.mockRejectedValue(new Error('Quiz not found'));

        
      await expect(questionService.createQuestion(questionData))
        .rejects.toThrow('Quiz not found');
    });
  });

  describe('getQuestionsByQuiz', () => {
    it.skip('should return questions for quiz without answers', async () => {
         
      const quizId = 'quiz123';
      const mockQuestions = [
        {
          id: '1',
          question: 'Q1',
          type: 'single-choice',
          toPublicJSON: jest.fn().mockReturnValue({ 
            id: '1', 
            question: 'Q1', 
            type: 'single-choice' 
          })
        },    
        {
          id: '2',
          question: 'Q2',
          type: 'multiple-choice',
          toPublicJSON: jest.fn().mockReturnValue({ 
            id: '2', 
            question: 'Q2', 
            type: 'multiple-choice' 
          })
        }
      ];

      const publicQuestions = mockQuestions.map(q => q.toPublicJSON());
      
      Question.findByQuiz = jest.fn().mockResolvedValue(mockQuestions);

         
      const result = await questionService.getQuestionsByQuiz(quizId, false);

         
      expect(Question.findByQuiz).toHaveBeenCalledWith('quiz123', false);
      expect(result).toEqual([
        { id: '1', question: 'Q1', type: 'single-choice' },
        { id: '2', question: 'Q2', type: 'multiple-choice' }
      ]);
    });

    it('should return questions with answers when includeAnswers is true', async () => {
         
      const quizId = 'quiz123';
      const mockQuestionsWithAnswers = [
        {
          id: '1',
          question: 'Q1',
          type: 'single-choice',
          answer: 'Correct answer',
          toPublicJSON: jest.fn().mockReturnValue({ 
            id: '1', 
            question: 'Q1', 
            type: 'single-choice',
            answer: 'Correct answer'
          })
        }
      ];

      Question.findByQuiz = jest.fn().mockResolvedValue(mockQuestionsWithAnswers);

         
      const result = await questionService.getQuestionsByQuiz(quizId, true);

         
      expect(Question.findByQuiz).toHaveBeenCalledWith('quiz123', true);
      expect(result[0]).toHaveProperty('answer', 'Correct answer');
    });

    it('should handle empty result set', async () => {
         
      Question.findByQuiz.mockResolvedValue([]);

         
      const result = await questionService.getQuestionsByQuiz('quiz123', false);

         
      expect(result).toEqual([]);
    });

    it('should throw error when database operation fails', async () => {
         
      Question.findByQuiz.mockRejectedValue(new Error('Database error'));

        
      await expect(questionService.getQuestionsByQuiz('quiz123'))
        .rejects.toThrow('Database error');
    });
  });

  describe('submitQuizAnswers', () => {
    it('should calculate score for single-choice questions', async () => {
         
      const quizId = 'quiz123';
      const answers = [
        {
          questionId: 'q1',
          selectedOptionId: 1
        }
      ];

      const mockQuestion = {
        _id: 'q1',
        quizId: { toString: () => 'quiz123' },
        type: 'single-choice',
        options: ['Wrong', 'Correct'],
        answer: 'Correct',
        points: 1
      };

      Question.findById.mockResolvedValue(mockQuestion);

         
      const result = await questionService.submitQuizAnswers(quizId, answers);

         
      expect(Question.findById).toHaveBeenCalledWith('q1');
      expect(result).toEqual({
        score: 1,
        total: 1
      });
    });

    it('should calculate score for multiple-choice questions', async () => {
         
      const quizId = 'quiz123';
      const answers = [
        {
          questionId: 'q1',
          selectedOptionIds: [0, 1] 
        }
      ];

      const mockQuestion = {
        _id: 'q1',
        quizId: { toString: () => 'quiz123' },
        type: 'multiple-choice',
        options: ['A', 'B', 'C'],
        answer: ['A', 'B'], 
        points: 1
      };

      Question.findById.mockResolvedValue(mockQuestion);

         
      const result = await questionService.submitQuizAnswers(quizId, answers);

         
      expect(result).toEqual({
        score: 1,
        total: 1
      });
    });

    it('should calculate score for text-based questions', async () => {
         
      const quizId = 'quiz123';
      const answers = [
        {
          questionId: 'q1',
          textAnswer: 'paris'
        }
      ];

      const mockQuestion = {
        _id: 'q1',
        quizId: { toString: () => 'quiz123' },
        type: 'text-based',
        options: [],
        answer: 'Paris',
        points: 1
      };

      Question.findById.mockResolvedValue(mockQuestion);

         
      const result = await questionService.submitQuizAnswers(quizId, answers);

         
      expect(result).toEqual({
        score: 1,
        total: 1
      });
    });

    it('should throw error when question not found', async () => {
         
      const quizId = 'quiz123';
      const answers = [
        {
          questionId: 'nonexistent'
        }
      ];

      Question.findById.mockResolvedValue(null);

        
      await expect(questionService.submitQuizAnswers(quizId, answers))
        .rejects.toThrow('Question not found: nonexistent');
    });

    it('should throw error when question belongs to different quiz', async () => {
         
      const quizId = 'quiz123';
      const answers = [
        {
          questionId: 'q1'
        }
      ];

      const mockQuestion = {
        _id: 'q1',
        quizId: { toString: () => 'different-quiz' },
        type: 'single-choice'
      };

      Question.findById.mockResolvedValue(mockQuestion);

        
      await expect(questionService.submitQuizAnswers(quizId, answers))
        .rejects.toThrow('Question q1 does not belong to quiz quiz123');
    });

    it('should calculate score for multiple-choice with correct indices', async () => {
         
      const quizId = 'quiz123';
      const answers = [
        {
          questionId: 'q1',
          selectedOptionIds: [0, 1] 
        }
      ];

      const mockQuestion = {
        _id: 'q1',
        quizId: { toString: () => 'quiz123' },
        type: 'multiple-choice',
        options: ['A', 'B', 'C'],
        answer: ['A', 'B'],
        points: 1
      };

      Question.findById.mockResolvedValue(mockQuestion);

         
      const result = await questionService.submitQuizAnswers(quizId, answers);

         
      expect(result).toEqual({
        score: 1,
        total: 1
      });
    });

    it('should score 0 for incorrect multiple-choice answers', async () => {
         
      const quizId = 'quiz123';
      const answers = [
        {
          questionId: 'q1',
          selectedOptionIds: [0, 2] 
        }
      ];

      const mockQuestion = {
        _id: 'q1',
        quizId: { toString: () => 'quiz123' },
        type: 'multiple-choice',
        options: ['A', 'B', 'C'],
        answer: ['A', 'B'],
        points: 1
      };

      Question.findById.mockResolvedValue(mockQuestion);

         
      const result = await questionService.submitQuizAnswers(quizId, answers);

         
      expect(result).toEqual({
        score: 0,
        total: 1
      });
    });

    it('should handle case-insensitive text answers', async () => {
         
      const quizId = 'quiz123';
      const answers = [
        {
          questionId: 'q1',
          textAnswer: 'PARIS   '
        }
      ];

      const mockQuestion = {
        _id: 'q1',
        quizId: { toString: () => 'quiz123' },
        type: 'text-based',
        options: [],
        answer: '  paris  ',
        points: 1
      };

      Question.findById.mockResolvedValue(mockQuestion);

         
      const result = await questionService.submitQuizAnswers(quizId, answers);

         
      expect(result).toEqual({
        score: 1,
        total: 1
      });
    });

    it('should throw error for invalid option index in single-choice', async () => {
         
      const quizId = 'quiz123';
      const answers = [
        {
          questionId: 'q1',
          selectedOptionId: 5 
        }
      ];

      const mockQuestion = {
        _id: 'q1',
        quizId: { toString: () => 'quiz123' },
        type: 'single-choice',
        options: ['A', 'B'],
        answer: 'A',
        points: 1
      };

      Question.findById.mockResolvedValue(mockQuestion);

        
      await expect(questionService.submitQuizAnswers(quizId, answers))
        .rejects.toThrow('Invalid option index 5 for question q1');
    });

    it('should throw error for invalid option index in multiple-choice', async () => {
         
      const quizId = 'quiz123';
      const answers = [
        {
          questionId: 'q1',
          selectedOptionIds: [0, 5] 
        }
      ];

      const mockQuestion = {
        _id: 'q1',
        quizId: { toString: () => 'quiz123' },
        type: 'multiple-choice',
        options: ['A', 'B'],
        answer: ['A'],
        points: 1
      };

      Question.findById.mockResolvedValue(mockQuestion);

        
      await expect(questionService.submitQuizAnswers(quizId, answers))
        .rejects.toThrow('Invalid option index 5 for question q1');
    });

    it('should throw error when text answer is missing', async () => {
         
      const quizId = 'quiz123';
      const answers = [
        {
          questionId: 'q1'
         
        }
      ];

      const mockQuestion = {
        _id: 'q1',
        quizId: { toString: () => 'quiz123' },
        type: 'text-based',
        options: [],
        answer: 'Paris',
        points: 1
      };

      Question.findById.mockResolvedValue(mockQuestion);

        
      await expect(questionService.submitQuizAnswers(quizId, answers))
        .rejects.toThrow('Text answer required for question q1');
    });

    it('should throw error when selectedOptionId is missing for single-choice', async () => {
         
      const quizId = 'quiz123';
      const answers = [
        {
          questionId: 'q1'
    
        }
      ];

      const mockQuestion = {
        _id: 'q1',
        quizId: { toString: () => 'quiz123' },
        type: 'single-choice',
        options: ['A', 'B'],
        answer: 'A',
        points: 1
      };

      Question.findById.mockResolvedValue(mockQuestion);

        
      await expect(questionService.submitQuizAnswers(quizId, answers))
        .rejects.toThrow('Selected option ID required for question q1');
    });

    it('should throw error when selectedOptionIds is missing for multiple-choice', async () => {
         
      const quizId = 'quiz123';
      const answers = [
        {
          questionId: 'q1'
        }
      ];

      const mockQuestion = {
        _id: 'q1',
        quizId: { toString: () => 'quiz123' },
        type: 'multiple-choice',
        options: ['A', 'B'],
        answer: ['A'],
        points: 1
      };

      Question.findById.mockResolvedValue(mockQuestion);

        
      await expect(questionService.submitQuizAnswers(quizId, answers))
        .rejects.toThrow('Selected option IDs array required for question q1');
    });

    it('should handle empty answers array', async () => {
         
      const quizId = 'quiz123';
      const answers = [];

        
      await expect(questionService.submitQuizAnswers(quizId, answers))
        .rejects.toThrow('Answers are required');
    });

    it('should handle null answers', async () => {
         
      const quizId = 'quiz123';

        
      await expect(questionService.submitQuizAnswers(quizId, null))
        .rejects.toThrow('Answers are required');
    });

    it('should handle mixed question types in single submission', async () => {
         
      const quizId = 'quiz123';
      const answers = [
        {
          questionId: 'q1',
          selectedOptionId: 1
        },
        {
          questionId: 'q2',
          selectedOptionIds: [0, 1]
        },
        {
          questionId: 'q3',
          textAnswer: 'paris'
        }
      ];

      const mockQuestions = [
        {
          _id: 'q1',
          quizId: { toString: () => 'quiz123' },
          type: 'single-choice',
          options: ['Wrong', 'Correct'],
          answer: 'Correct',
          points: 1
        },
        {
          _id: 'q2',
          quizId: { toString: () => 'quiz123' },
          type: 'multiple-choice',
          options: ['A', 'B', 'C'],
          answer: ['A', 'B'],
          points: 1
        },
        {
          _id: 'q3',
          quizId: { toString: () => 'quiz123' },
          type: 'text-based',
          options: [],
          answer: 'Paris',
          points: 1
        }
      ];

      Question.findById
        .mockResolvedValueOnce(mockQuestions[0])
        .mockResolvedValueOnce(mockQuestions[1])
        .mockResolvedValueOnce(mockQuestions[2]);

         
      const result = await questionService.submitQuizAnswers(quizId, answers);

         
      expect(result).toEqual({
        score: 3,
        total: 3
      });
    });

    it('should handle unknown question type with fallback to single-choice', async () => {
         
      const quizId = 'quiz123';
      const answers = [
        {
          questionId: 'q1',
          selectedOptionId: 1
        }
      ];

      const mockQuestion = {
        _id: 'q1',
        quizId: { toString: () => 'quiz123' },
        type: 'unknown-type',
        options: ['Wrong', 'Correct'],
        answer: 'Correct',
        points: 1
      };

      Question.findById.mockResolvedValue(mockQuestion);

         
      const result = await questionService.submitQuizAnswers(quizId, answers);

         
      expect(result).toEqual({
        score: 1,
        total: 1
      });
    });
  });

  describe('getQuestionById', () => {
    it('should return question by ID', async () => {
         
      const mockQuestion = {
        _id: 'q1',
        toPublicJSON: jest.fn().mockReturnValue({
          id: 'q1',
          question: 'Test question'
        })
      };

      Question.findById.mockResolvedValue(mockQuestion);

         
      const result = await questionService.getQuestionById('q1');

         
      expect(Question.findById).toHaveBeenCalledWith('q1');
      expect(result).toEqual({
        id: 'q1',
        question: 'Test question'
      });
    });

    it('should return null when question not found', async () => {
         
      Question.findById.mockResolvedValue(null);

         
      const result = await questionService.getQuestionById('nonexistent');

         
      expect(result).toBeNull();
    });

    it('should throw error when database operation fails', async () => {
         
      Question.findById.mockRejectedValue(new Error('Database error'));

        
      await expect(questionService.getQuestionById('q1'))
        .rejects.toThrow('Database error');
    });
  });
});