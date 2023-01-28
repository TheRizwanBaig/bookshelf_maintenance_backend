const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    authorName: {
        type: String,
        required: true,
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
    addBy:{
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Plan to Read', 'Reading','Completed'],
        required: true,
        default: 'Plan to Read'
    },
    publicationDate: {
        type: Date,
        default: Date.now(),
        required: true,
      },
})

const bookModel = new mongoose.model('book', bookSchema)
module.exports = bookModel