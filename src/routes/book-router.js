const express = require('express');
const Book = require('../models/Book.js');
const bookId = require("../utils/randomId.js");
const router = express.Router();
const multer = require('multer');
const uploadToAws = require('../utils/uploadToAws');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })

router.post('/api/add-book', upload.single('pdf'), async (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': 'https://still-waters-66948.herokuapp.com',
  })
  const link = await uploadToAws.uploadFileToCloud(req.file.originalname, req.user.userId);
  console.log(link)
  const book = new Book({
    name: req.body.name,
    author: req.body.author,
    idBook: bookId.randomId(),
    creator: req.user.userId,
    link: link
  })
  console.log({body: req.body, file: req.file})
  book.save().then(() => res.send('Successful! Book saved!'))
    .catch((err) => console.log(err));
})

router.get('/api/get-books', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': 'https://still-waters-66948.herokuapp.com',
  })
  Book.find().then((data) => res.json({items: data}))
    .catch((err) => console.log(err));
})

router.post('/api/user-books', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': 'https://still-waters-66948.herokuapp.com',
  })
  if (req.body.id === 0) return res.status(200);
  Book.find({creator: req.body.id}).then((data) => res.json({items: data}))
    .catch((err) => console.log(err));
})

router.post('/api/delete-book', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': 'https://still-waters-66948.herokuapp.com',
  })
  Book.findOneAndDelete({idBook: req.body.id})
    .then(() => res.status(200).json({message: 'Successful! Book deleted!'}))
    .catch((err) => console.log(err));
})

module.exports = router