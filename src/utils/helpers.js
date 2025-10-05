const { HTTP_STATUS } = require('./constants');


class ApiResponse {
 
  static success(res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) {
    const response = {
      success: true,
      message
    };

    if (data !== null) {
      if (Array.isArray(data)) {
        response.data = data;
        response.count = data.length;
      } else {
        response.data = data;
      }
    }

    return res.status(statusCode).json(response);
  }


  static error(res, error = 'An error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null) {
    const response = {
      success: false,
      error
    };

    if (details) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  }


  static created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  
  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND);
  }


  static badRequest(res, message = 'Bad request', details = null) {
    return this.error(res, message, HTTP_STATUS.BAD_REQUEST, details);
  }

 
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message,
      data,
      pagination: {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: pagination.limit,
        hasNext: pagination.hasNext,
        hasPrev: pagination.hasPrev
      }
    });
  }
}

const handleAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


const sendSuccess = (res, data, statusCode = 200, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    count: Array.isArray(data) ? data.length : undefined,
    timestamp: new Date().toISOString()
  });
};


const sendError = (res, message, statusCode = 400, details = null) => {
  res.status(statusCode).json({
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString()
  });
};


const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};


const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

module.exports = {
  ApiResponse,
  handleAsync,
  sendSuccess,
  sendError,
  isValidObjectId,
  sanitizeString
};
