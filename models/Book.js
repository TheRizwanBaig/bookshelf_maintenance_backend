const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    picURL: {
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
        enum: ['plan_to_read', 'reading','completed'],
        default: 'plan_to_read'
    },
    publicationDate: {
        type: Date,
        default: Date.now(),
        required: true,
      },
})

const bookModel = new mongoose.model('book', bookSchema)
module.exports = bookModel