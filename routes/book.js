const express = require('express')
const bookModel = require('../models/Book')
const { verifyUserTokenMiddleware } = require('../middleware/verifyUserToken')
const router = require('express').Router()
const isEmpty = require('is-empty')

const app = express()

router.post('/addBook', (req, res) => {
  let newBook = new bookModel({
    title: req.body.title,
    authorName: req.body.authorName,
    publicationHouse: req.body.publicationHouse,
    genre: req.body.genre,
    publicationYear: req.body.publicationYear,
    addBy: req.body.addBy,
    status: req.body.status,
    publicationDate: Date.now()
  })
  newBook.save((err, newDoc) => {
    if (err) {
      console.log(err)
      return res.status(200).json({
        error: true,
        message: 'An unexpected error occurred. Please try again later.'
      })
    } else {
      return res.status(200).json({
        error: false,
        message: 'Book added successfully.',
        data: newDoc
      })
    }
  })
})

router.post('/getBooks', (req, res) => {
  let { title,sort,userID } = req.body
  let filterCriteria = {}

  filterCirteria = !isEmpty(title)
    ? (filterCriteria.title = { $in: title.split(',') })
    : filterCriteria

  sortCirteria = !isEmpty(sort)
    ? (sort = "title")
    : sort

  bookModel
    .aggregate([
      { $match: filterCriteria },
      { $match: {addBy:userID} },
      { $sort: {sort:1} },
      { $group: { _id: '$status', books: { $push: '$$ROOT' } } }
    ])
    .then(data => {
      return res.status(200).json({
        error: false,
        message: 'Books found.',
        data: data
      })
    })
    .catch(err => {
      return res.status(200).json({
        error: true,
        message: 'An unexpected error occurred while fetching books'
      })
    })
})
router.post('/updateStatus', (req, res) => {
  if (!req.body.ID) {
    return res.status(200).json({
      error: true,
      message: 'Book object id is required.'
    })
  } else if (!req.body.status) {
    return res.status(200).json({
      error: true,
      message: 'Book status is required.'
    })
  }
  bookModel.findOneAndUpdate(
    { _id: req.body.ID },
    { status: req.body.status },
    (err, doc) => {
      if (err) {
        return res.status(200).json({
          error: true,
          message: 'An unexpected error occurred. Please try again later.'
        })
      } else if (!doc) {
        return res.status(200).json({
          error: true,
          message: 'Book not found. Please recheck object.'
        })
      } else {
        return res.status(200).json({
          error: false,
          message: 'Book updated successfully.',
          data: doc
        })
      }
    }
  )
})
module.exports = router
