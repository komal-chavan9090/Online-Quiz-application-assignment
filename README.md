# Online-Quiz-application-assignment

A RESTful API for creating, managing, and taking quizzes with support for multiple question types and automatic scoring.

## Features

- **Quiz Management**: Create and retrieve quizzes with metadata
- **Multiple Question Types**: Single-choice, multiple-choice, and text-based questions
- **Quiz Submission**: Automatic scoring of submitted answers

## Tech Stack

- **Node.js & Express**: Web framework
- **MongoDB & Mongoose**: Database and ODM
- **Jest**: Testing framework

## Assumptions & Design Choices

- Only quiz creation, question creation, and quiz submission are supported (no update/delete endpoints)
- Questions must have non-empty answers; validation is enforced for all types
- Options for single/multiple-choice questions are arrays of strings; answers are string or array of strings
- Error handling is centralized for consistent API responses
- Service layer is unit tested with mocks for isolation

## Installation

1. Clone the repository
	 ```bash
	 git clone https://github.com/komal-chavan9090/Online-Quiz-application-assignment.git
	 cd Online-Quiz-application-assignment
	 ```

2. Install dependencies
	 ```bash
	 npm install
	 ```

3. Set up environment variables in a [`.env`](.env ) file
	 ```
	 PORT=3000
	 MONGODB_URI=mongodb://localhost:27017/quiz-app
	 NODE_ENV=development
	 ```

4. Start the server
	 ```bash
	 # Development mode
	 npm run dev
   
	 # Production mode
	 npm start
	 ```

## API Endpoints

### Quiz Endpoints

- **POST /api/quizzes** - Create a new quiz
- **GET /api/quizzes** - Get all quizzes
- **GET /api/quizzes/:id** - Get a specific quiz by ID
### Question Endpoints

- **POST /api/questions** - Create a new question
- **GET /api/questions/quiz/:quizId** - Get questions for a quiz
- **GET /api/questions/:id** - Get a specific question by ID
- **POST /api/questions/quiz/:quizId/submit** - Submit answers and get score

## Examples

### Creating a Quiz

```bash
curl -X POST http://localhost:3000/api/quizzes \
	-H "Content-Type: application/json" \
	-d '{
		"title": "JavaScript Basics",
		"description": "Test your knowledge of JavaScript",
		"numberOfQuestions": 5
	}'
```

### Adding Questions

Single-choice question:
```bash
curl -X POST http://localhost:3000/api/questions \
	-H "Content-Type: application/json" \
	-d '{
		"question": "Which is a JavaScript framework?",
		"type": "single-choice",
		"options": ["Django", "React", "Flask", "Laravel"],
		"answer": "React",
		"quizId": "YOUR_QUIZ_ID_HERE"
	}'
```

Multiple-choice question:
```bash
curl -X POST http://localhost:3000/api/questions \
	-H "Content-Type: application/json" \
	-d '{
		"question": "Select all JavaScript data types",
		"type": "multiple-choice",
		"options": ["String", "Integer", "Boolean", "Character", "Object"],
		"answer": ["String", "Boolean", "Object"],
		"quizId": "YOUR_QUIZ_ID_HERE"
	}'
```

Text-based question:
```bash
curl -X POST http://localhost:3000/api/questions \
	-H "Content-Type: application/json" \
	-d '{
		"question": "Explain what is Node.js in one sentence.",
		"type": "text-based",
		"options": [],
		"answer": "Node.js is a JavaScript runtime environment",
		"quizId": "YOUR_QUIZ_ID_HERE"
	}'
```

### Taking a Quiz

```bash
curl -X POST http://localhost:3000/api/questions/quiz/YOUR_QUIZ_ID_HERE/submit \
	-H "Content-Type: application/json" \
	-d '{
		"answers": [
			{"questionId": "QUESTION_ID_1", "selectedOptionId": 1},
			{"questionId": "QUESTION_ID_2", "selectedOptionIds": [0, 2]},
			{"questionId": "QUESTION_ID_3", "textAnswer": "Node.js is a JavaScript runtime"}
		]
	}'
```

## Project Structure

```
src/
├── app.js                 # Express application setup
├── config/                # Configuration files
├── controllers/           # Request handlers
├── middleware/            # Custom middleware
├── models/                # Database models
├── routes/                # API routes
├── services/              # Business logic
└── utils/                 # Utilities
tests/
└── unit/                  # Unit tests
```

## Testing

Run the test suite with:
```bash
npm test
```

Current test suite status:
- 43 total tests across 2 test suites
- 42 passing tests (97.7% success rate)

## License

[MIT](https://choosealicense.com/licenses/mit/)

