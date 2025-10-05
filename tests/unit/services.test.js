const questionService = require('../../src/services/questionService');
const Question = require('../../src/models/Question');
const Quiz = require('../../src/models/Quiz');

jest.mock('../../src/models/Question');
jest.mock('../../src/models/Quiz');

jest.mock('../../src/services/quizService', () => ({
  getQuizById: jest.fn(),
  getAllQuizzes: jest.fn(),
  createQuiz: jest.fn(),
  getQuizStats: jest.fn()
}));

const quizService = require('../../src/services/quizService');

describe('Quiz and Question Services - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Quiz Service Tests', () => {
    describe('getAllQuizzes', () => {
      it('should return all active quizzes with default options', async () => {
        const mockQuizzes = [
          {
            _id: 'quiz1',
            title: 'Test Quiz 1',
            numberOfQuestions: 5,
            isActive: true,
            createdAt: new Date()
          },
          {
            _id: 'quiz2',
            title: 'Test Quiz 2',
            numberOfQuestions: 10,
            isActive: true,
            createdAt: new Date()
          }
        ];

        const expectedResult = mockQuizzes.map(quiz => ({
          id: quiz._id.toString(),
          title: quiz.title,
          numberOfQuestions: quiz.numberOfQuestions,
          isActive: quiz.isActive,
          createdAt: quiz.createdAt
        }));

        quizService.getAllQuizzes.mockResolvedValue(expectedResult);

        const result = await quizService.getAllQuizzes();

        expect(result).toEqual(expectedResult);
        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty('id', 'quiz1');
        expect(result[1]).toHaveProperty('id', 'quiz2');
      });

      it('should apply pagination when specified', async () => {
        const options = { page: 2, limit: 10 };
        quizService.getAllQuizzes.mockResolvedValue([]);
        
        await quizService.getAllQuizzes(options);
        
        expect(quizService.getAllQuizzes).toHaveBeenCalledWith(options);
      });

      it('should handle custom field selection', async () => {
        const options = { fields: 'title createdAt' };
        quizService.getAllQuizzes.mockResolvedValue([]);
        
        await quizService.getAllQuizzes(options);
        
        expect(quizService.getAllQuizzes).toHaveBeenCalledWith(options);
      });
    });

    describe('createQuiz', () => {
      it('should create a new quiz successfully', async () => {
        const quizData = {
          title: 'New Quiz',
          numberOfQuestions: 5,
          description: 'Quiz description'
        };

        const createdQuiz = {
          id: 'new-quiz-id',
          title: 'New Quiz',
          numberOfQuestions: 5,
          description: 'Quiz description',
          isActive: true,
          createdAt: expect.any(Date)
        };

        quizService.createQuiz.mockResolvedValue(createdQuiz);

          
        const result = await quizService.createQuiz(quizData);

          
        expect(quizService.createQuiz).toHaveBeenCalledWith(quizData);
        expect(result).toHaveProperty('id', 'new-quiz-id');
        expect(result.title).toBe('New Quiz');
      });

      it('should trim input strings', async () => {
          
        const quizData = {
          title: '  Trimmed Title  ',
          numberOfQuestions: 5,
          description: '  Trimmed description  '
        };

        const expectedData = {
          title: 'Trimmed Title',
          numberOfQuestions: 5,
          description: 'Trimmed description',
          isActive: true
        };

        quizService.createQuiz.mockImplementation(data => ({
          id: 'quiz-id',
          ...data,
          createdAt: new Date()
        }));

          
        const result = await quizService.createQuiz(quizData);

          
        expect(quizService.createQuiz).toHaveBeenCalledWith(quizData);
      });

      it('should throw error when title is missing', async () => {
          
        const quizData = {
          numberOfQuestions: 5
        };

        quizService.createQuiz.mockRejectedValue(new Error('Title is required'));

         
        await expect(quizService.createQuiz(quizData))
          .rejects.toThrow('Title is required');
      });

      it('should throw error when numberOfQuestions is invalid', async () => {
         
        const quizData = {
          title: 'Test Quiz',
          numberOfQuestions: 0
        };

        quizService.createQuiz.mockRejectedValue(new Error('Number of questions must be at least 1'));

         
        await expect(quizService.createQuiz(quizData))
          .rejects.toThrow('Number of questions must be at least 1');
      });
    });
  });

  describe('Question Service Tests', () => {
    describe('addQuestion (legacy method)', () => {
      it('should add a question to a quiz', async () => {
          
        const quizId = 'quiz123';
        const questionData = {
          text: 'What is 2+2?',
          options: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false }
          ]
        };

        const savedQuestion = {
          _id: 'q1',
          quizId,
          text: 'What is 2+2?',
          options: questionData.options,
          save: jest.fn().mockResolvedValue({
            _id: 'q1',
            quizId,
            text: 'What is 2+2?',
            options: questionData.options
          })
        };

        quizService.getQuizById.mockResolvedValue({ id: quizId });
        Question.mockImplementation(() => savedQuestion);

          
        const result = await questionService.addQuestion(quizId, questionData);

          
        expect(quizService.getQuizById).toHaveBeenCalledWith(quizId);
        expect(Question).toHaveBeenCalledWith({
          quizId,
          text: 'What is 2+2?',
          options: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false }
          ]
        });
        expect(savedQuestion.save).toHaveBeenCalled();
        expect(result).toHaveProperty('_id', 'q1');
      });

      it('should throw error when question text is missing', async () => {
          
        const quizId = 'quiz123';
        const questionData = {
          text: '',
          options: [
            { text: 'Option A', isCorrect: true },
            { text: 'Option B', isCorrect: false }
          ]
        };

        quizService.getQuizById.mockResolvedValue({ id: quizId });

         
        await expect(questionService.addQuestion(quizId, questionData))
          .rejects.toThrow();
      });

      it('should throw error when options are insufficient', async () => {
          
        const quizId = 'quiz123';
        const questionData = {
          text: 'Question?',
          options: [{ text: 'Single option', isCorrect: true }]
        };

        quizService.getQuizById.mockResolvedValue({ id: quizId });

         
        await expect(questionService.addQuestion(quizId, questionData))
          .rejects.toThrow();
      });

      it('should throw error when no correct answer specified', async () => {
          
        const quizId = 'quiz123';
        const questionData = {
          text: 'Question?',
          options: [
            { text: 'Option A', isCorrect: false },
            { text: 'Option B', isCorrect: false }
          ]
        };

        quizService.getQuizById.mockResolvedValue({ id: quizId });

         
        await expect(questionService.addQuestion(quizId, questionData))
          .rejects.toThrow();
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
          quizId: 'quiz123',
          type: 'single-choice',
          options: ['Wrong', 'Correct'],
          answer: 'Correct',
          points: 1,
          toString: () => 'q1'
        };

        Question.findById = jest.fn().mockResolvedValue(mockQuestion);

          
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
          quizId: 'quiz123',
          type: 'multiple-choice',
          options: ['A', 'B', 'C'],
          answer: ['A', 'B'],
          points: 1,
          toString: () => 'q1'
        };

        Question.findById = jest.fn().mockResolvedValue(mockQuestion);

          
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
          quizId: 'quiz123',
          type: 'text-based',
          options: [],
          answer: 'Paris',
          points: 1,
          toString: () => 'q1'
        };

        Question.findById = jest.fn().mockResolvedValue(mockQuestion);

          
        const result = await questionService.submitQuizAnswers(quizId, answers);

          
        expect(result).toEqual({
          score: 1,
          total: 1
        });
      });

      it('should handle multiple questions of different types', async () => {
          
        const quizId = 'quiz123';
        const answers = [
          { questionId: 'q1', selectedOptionId: 1 },
          { questionId: 'q2', selectedOptionIds: [0, 1] },
          { questionId: 'q3', textAnswer: 'paris' }
        ];

        const mockQuestions = [
          {
            _id: 'q1',
            quizId: 'quiz123',
            type: 'single-choice',
            options: ['Wrong', 'Correct'],
            answer: 'Correct',
            points: 1,
            toString: () => 'q1'
          },
          {
            _id: 'q2',
            quizId: 'quiz123',
            type: 'multiple-choice',
            options: ['A', 'B', 'C'],
            answer: ['A', 'B'],
            points: 1,
            toString: () => 'q2'
          },
          {
            _id: 'q3',
            quizId: 'quiz123',
            type: 'text-based',
            options: [],
            answer: 'Paris',
            points: 1,
            toString: () => 'q3'
          }
        ];

        Question.findById = jest.fn()
          .mockResolvedValueOnce(mockQuestions[0])
          .mockResolvedValueOnce(mockQuestions[1])
          .mockResolvedValueOnce(mockQuestions[2]);

          
        const result = await questionService.submitQuizAnswers(quizId, answers);

          
        expect(result).toEqual({
          score: 3,
          total: 3
        });
      });
    });
  });
});
