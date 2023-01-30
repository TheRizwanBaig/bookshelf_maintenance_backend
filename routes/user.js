const express = require('express')
const User = require('../models/User')
const bookModel = require('../models/Book')
const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {
  validateUserLoginInput,
  validateUserRegisterInput
} = require('../validation/userAuthValidation')
const verifyToken = require('../middleware/verifyToken')
const app = express()

router.post('/signup', (req, res) => {
  const { name, email, password } = req.body
  const { errors, isValid } = validateUserRegisterInput({
    name,
    email,
    password
  })

  // Check validation
  console.log('input validation')
  if (!isValid) {
    return res.status(200).json({
      error: true,
      error_message: errors,
      message: 'Input validation failed. Check error messages.'
    })
  }
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      res.send({ error: true, message: 'User already registered' })
    } else {
      const user = new User({
        name: name,
        email: email,
        password: password
      })

      bcrypt.genSalt(10, (err, salt) => {
        // console.log('gen salt error')
        bcrypt.hash(user.password, salt, (err, hash) => {
          // console.log(err, "hashing error")
          user.password = hash
          user
            .save()
            .then(doc => {
              return res.status(200).json({
                error: false,
                message: 'User successfully registered',
                data: doc
              })
            })
            .catch(err => {
              return res.status(200).json({
                error: true,
                message: err.message
              })
            })
        })
      })
    }
  })
})
//Login
router.post('/login', (req, res) => {
  const { email, password } = req.body
  // console.log(email,password)

  const { errors, isValid } = validateUserLoginInput({ email, password })

  // Check validation
  if (!isValid) {
    return res.status(200).json({
      error: true,
      error_message: errors,
      message: 'Please enter a valid email ID and password'
    })
  }

  User.findOne(
    {
      email: {
        $in: email
      }
    },
    (err, user) => {
      if (user) {
        //   if (password === user.password) {
        //     res.send({ message: "Login Successful", user: user });
        //   } else {
        //     res.send({ message: "Wrong Password" });
        //   }
        // console.log(user.email)
        bcrypt.compare(password, user.password).then(isMatch => {
          // console.log(isMatch)
          if (isMatch) {
            console.log('password match')
            const payload = {
              _id: user._id,
              email: user.email,
              name: user.name
            }
            // sign Token
            jwt.sign(
              payload,
              process.env.ENCRYPTION_SECRET_USER,
              { expiresIn: 86400 },
              (signErr, token) => {
                if (signErr) {
                  console.log('token sign error')
                  console.log(signErr)
                  return res.status.json({
                    error: true,
                    message: 'An unexpected error occurred. Please try again'
                  })
                } else {
                  console.log('login success')
                  // return res
                  //   .status(200)
                  //   .cookie('auth_token_usr', token, {
                  //     httpOnly: true,
                  //     secure: process.env.NODE_ENV == 'production'
                  //   })
                  //   .json({
                  //     message: 'Login successful!',
                  //     userData: {userID:user._id,email:user.email,name:user.name},
                  //   })
                  res.send({
                    error: false,
                    message: 'Login Successful',
                    userData: {
                      userID: user._id,
                      email: user.email,
                      name: user.name
                    },
                    token: token
                  })
                }
              }
            )
          } else {
            return res.status(200).json({
              error: true,
              message: 'Incorrect password. Please retry.'
            })
          }
        })
      } else {
        res.send({ error: true, message: 'Account not register' })
      }
    }
  )
})
router.get('/logout', async (req, res) => {
  return res.status(200).clearCookie('auth_token_usr').json({
    message: 'Logout successful!'
  })
})
router.delete('/delete', (req, res) => {
  if (!req.headers['authorization']) {
    return res.status(200).json({
      error: true,
      message: 'Access denied. User token not provided.'
    })
  }
  verifyToken(req.headers['authorization'], async user => {
    const { isValid, _id, name } = user

    if (!isValid) {
      return res.status(401).json({
        error: true,
        message: 'Access denied. Limited for users(s).'
      })
    } else {
      await bookModel.deleteMany({ addBy: _id })
      await User.deleteOne({ _id: _id })
      return res.status(200).json({
        error: false,
        message: 'Account deleted successfully.'
      })
    }
  })
})
module.exports = router
