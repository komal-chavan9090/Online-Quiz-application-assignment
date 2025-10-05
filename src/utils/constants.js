// API Response status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple-choice',
  TRUE_FALSE: 'true-false',
  FILL_BLANK: 'fill-blank'
};

const VALIDATION_RULES = {
  QUIZ: {
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 1000
  },
  QUESTION: {
    TEXT_MIN_LENGTH: 10,
    TEXT_MAX_LENGTH: 1000,
    OPTION_TEXT_MAX_LENGTH: 500,
    MIN_OPTIONS: 2,
    MAX_OPTIONS: 6,
    POINTS_MIN: 1,
    POINTS_MAX: 10,
    EXPLANATION_MAX_LENGTH: 500
  }
};

// Default values
const DEFAULTS = {
  QUIZ: {
    IS_ACTIVE: true
  },
  QUESTION: {
    TYPE: QUESTION_TYPES.MULTIPLE_CHOICE,
    POINTS: 1,
    IS_ACTIVE: true
  }
};

// Error messages
const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED_FIELD: (field) => `${field} is required`,
    INVALID_FORMAT: (field) => `Invalid ${field} format`,
    INVALID_ID: (entity) => `Invalid ${entity} ID format`,
    FIELD_TOO_SHORT: (field, min) => `${field} must be at least ${min} characters long`,
    FIELD_TOO_LONG: (field, max) => `${field} cannot exceed ${max} characters`,
    INVALID_ENUM: (field, values) => `${field} must be one of: ${values.join(', ')}`,
    INVALID_RANGE: (field, min, max) => `${field} must be between ${min} and ${max}`,
    EXACTLY_ONE_CORRECT: 'Exactly one correct answer is required',
    MIN_OPTIONS: (min) => `At least ${min} options are required`,
    MAX_OPTIONS: (max) => `Maximum ${max} options allowed`
  },
  NOT_FOUND: {
    QUIZ: 'Quiz not found',
    QUESTION: 'Question not found',
    OPTION: 'Option not found'
  },
  DATABASE: {
    CONNECTION_ERROR: 'Database connection error',
    DUPLICATE_KEY: (field) => `${field} already exists`
  },
  GENERAL: {
    SERVER_ERROR: 'Internal server error',
    ROUTE_NOT_FOUND: (route) => `Route ${route} not found`
  }
};

// Success messages
const SUCCESS_MESSAGES = {
  QUIZ: {
    CREATED: 'Quiz created successfully'
  },
  QUESTION: {
    CREATED: 'Question added successfully'
  },
  SUBMISSION: {
    COMPLETED: 'Quiz submitted successfully'
  }
};

module.exports = {
  HTTP_STATUS,
  QUESTION_TYPES,
  VALIDATION_RULES,
  DEFAULTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
