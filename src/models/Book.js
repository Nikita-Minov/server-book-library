const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  name: String,
  author: String,
  idBook: Number,
  creator: Number,
  link: String,
  fileName: String,
});

module.exports = mongoose.model('Book', bookSchema);