const express = require('express')
const bookModel = require('../models/Book')
const { verifyUserTokenMiddleware } = require('../middleware/verifyUserToken')
const router = require('express').Router()
const isEmpty = require('is-empty')
const verifyToken = require('../middleware/verifyToken')

const app = express()

router.post('/addBook', (req, res) => {
  if (!req.headers['authorization']) {
    return res.status(200).json({
      error: true,
      message: 'Access denied. User token not provided.'
    })
  }
  verifyToken(req.headers['authorization'], item => {
    const isValid = item.isValid
    const id = item._id
    const name = item.name
    if (!isValid) {
      return res.status(200).json({
        error: true,
        message: 'Access denied. Limited for users(s).'
      })
    } else {
      let newBook = new bookModel({
        title: req.body.title,
        picURL: req.body.picURL,
        authorName: req.body.authorName,
        publicationHouse: req.body.publicationHouse,
        genre: req.body.genre,
        publicationYear: req.body.publicationYear,
        addBy: id,
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
    }
  })
})

router.post('/getBooks', (req, res) => {
  if (!req.headers['authorization']) {
    return res.status(200).json({
      error: true,
      message: 'Access denied. User token not provided.'
    })
  }
  verifyToken(req.headers['authorization'], item => {
    const isValid = item.isValid
    const id = item._id
    const name = item.name
    if (!isValid) {
      return res.status(200).json({
        error: true,
        message: 'Access denied. Limited for users(s).'
      })
    } else {
      let { title, sort } = req.body
      let filterCriteria = {}
      filterCirteria = !isEmpty(title)
        ? (filterCriteria.title = { $regex: title, $options: 'i' })
        : filterCriteria

      sortCirteria = !isEmpty(sort) ? (sort = 'title') : sort

      bookModel
        .aggregate([
          { $match: filterCriteria },
          { $match: { addBy: id } },
          { $sort: { sort: 1 } },
          { $group: { _id: '$status', books: { $push: '$$ROOT' } } }
        ])
        .then(data => {
          let resp = {}
          data.map(dataByStatus => {
            resp[dataByStatus._id] = dataByStatus.books
          })
          return res.status(200).json(resp)
        })
        .catch(err => {
          console.log(err)
          return res.status(200).json({
            error: true,
            message: err
          })
        })
    }
  })
})
router.post('/updateStatus', (req, res) => {
  if (!req.headers['authorization']) {
    return res.status(200).json({
      error: true,
      message: 'Access denied. User token not provided.'
    })
  }
  verifyToken(req.headers['authorization'], item => {
    const isValid = item.isValid
    const id = item._id
    const name = item.name
    if (!isValid) {
      return res.status(200).json({
        error: true,
        message: 'Access denied. Limited for users(s).'
      })
    } else {
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
    }
  })
})
router.post('/editBook', (req, res) => {
  if (!req.headers['authorization']) {
    return res.status(200).json({
      error: true,
      message: 'Access denied. User token not provided.'
    })
  }
  verifyToken(req.headers['authorization'], item => {
    const isValid = item.isValid
    const id = item._id
    const name = item.name
    if (!isValid) {
      return res.status(200).json({
        error: true,
        message: 'Access denied. Limited for users(s).'
      })
    } else {
      if (!req.body._id) {
        return res.status(200).json({
          error: true,
          message: 'Book object id is required.'
        })
      }
      bookModel.findOneAndUpdate(
        { _id: req.body._id },
        {
          title: req.body.title,
          picURL: req.body.picURL,
          authorName: req.body.authorName,
          publicationHouse: req.body.publicationHouse,
          genre: req.body.genre,
          publicationYear: req.body.publicationYear,
          addBy: id,
          status: req.body.status,
          publicationDate: Date.now()
        },
        { new: true },
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
    }
  })
})
router.post('/deleteBook', (req, res) => {
  if (!req.headers['authorization']) {
    return res.status(200).json({
      error: true,
      message: 'Access denied. User token not provided.'
    })
  }
  verifyToken(req.headers['authorization'],  user => {
    const { isValid, _id, name } = user

    if (!isValid) {
      return res.status(401).json({
        error: true,
        message: 'Access denied. Limited for users(s).'
      })
    } else {
       bookModel.deleteOne({ _id: req.body._id } ,(err,doc)=>{
        if(err){
          return res.status(200).json({
            error: true,
            message: err
          })
        }else if(doc){
          return res.status(200).json({
            error: false,
            message: 'Book deleted successfully.'
          })
        }
       })
     
    }
  })
})
module.exports = router
