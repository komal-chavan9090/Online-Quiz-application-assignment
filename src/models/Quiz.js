const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"],
    index: true 
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  numberOfQuestions: {
    type: Number,
    required: [true, "Number of questions is required"],
    min: [1, "Must have at least 1 question"],
    max: [100, "Cannot exceed 100 questions"]
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});


quizSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model("Quiz", quizSchema);
