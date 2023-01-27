const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    authorName: {
        type: String,
        required: true,
        unique: true
    },
    publicationHouse: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    publicationYear: {
        type: String,
        required: true
    },
    publicationDate: {
        type: Date,
        default: Date.now(),
        required: true,
      },
})

const bookModel = new mongoose.model('book', bookSchema)
module.exports = bookModel