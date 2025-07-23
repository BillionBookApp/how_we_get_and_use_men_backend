const mongoose = require('mongoose');

const subSectionSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const topicSchema = new mongoose.Schema({
  title: String,
  subSections: [subSectionSchema],
});

const chapterSchema = new mongoose.Schema({
  number: Number,
  title: String,
  topics: [topicSchema],
});

const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: 'Momma',
  },
  withVoicesFrom: {
    type: [String],
    default: [],
  },
  publisher: {
    type: String,
    default: 'BillionStar Publishers Ltd.',
  },
  metadata: {
    type: Map,
    of: String,
    default: {},
    // you can insert: { dedication, about, letterToYoungerSelf, etc. }
  },
  chapters: [chapterSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Book', bookSchema);
