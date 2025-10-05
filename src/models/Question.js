const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ["multiple-choice", "single-choice", "text-based"],
    default: "single-choice",
    required: true
  },
  options: {
    type: [String],
    validate: {
      validator: function(options) {
        if (this.type === "text-based") {
          return !options || options.length === 0;
        }
        return options && options.length >= 2 && options.length <= 6;
      },
      message: "Options validation failed based on question type"
    }
  },
  answer: {
    type: mongoose.Schema.Types.Mixed, 
    required: true,
    validate: {
      validator: function(answer) {
        if (this.type === "text-based") {
          return typeof answer === "string" && answer.length <= 300;
        }
        if (this.type === "single-choice") {
          return typeof answer === "string" && this.options && this.options.includes(answer);
        }
        if (this.type === "multiple-choice") {
          return Array.isArray(answer) && 
                 answer.length >= 1 && 
                 answer.length <= this.options.length &&
                 answer.every(ans => this.options.includes(ans));
        }
        return false;
      },
      message: "Answer validation failed based on question type"
    }
  },
  points: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

questionSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    quizId: this.quizId,
    question: this.question,
    type: this.type,
    options: this.options || [],
    points: this.points,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

questionSchema.statics.findByQuiz = async function(quizId, includeAnswers = false) {
  const questions = await this.find({ quizId, isActive: true }).sort({ createdAt: 1 });
  
  if (includeAnswers) {
    return questions.map(q => ({
      id: q._id,
      quizId: q.quizId,
      question: q.question,
      type: q.type,
      options: q.options || [],
      answer: q.answer,
      points: q.points,
      isActive: q.isActive,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt
    }));
  }
  
  return questions.map(q => q.toPublicJSON());
};

module.exports = mongoose.model("Question", questionSchema);
