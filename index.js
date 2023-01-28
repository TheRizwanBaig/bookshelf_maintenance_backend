const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require("dotenv").config();

var cors = require('cors');

const userRoute = require('./routes/user')
const bookRoute = require('./routes/book')



const app = express();
app.use(bodyParser.urlencoded({ extended: true, limit: 100000}));
app.use(bodyParser.json());
app.use(cors());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
mongoose.set('strictQuery', false)

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.log(err))

//Routes
app.use('/api/user', userRoute)
app.use('/api/book', bookRoute)


  const port = process.env.PORT || 7000;

app.listen(port, () => {
  console.log('Server running on port ' + port)
})
