const express = require('express');
const Book = require('../models/Book.js');
const bookId = require("../utils/randomId.js");
const router = express.Router();
const multer = require('multer');
const uploadToAws = require('../utils/uploadToAws');
const {deleteFileFromCloud} = require("../utils/deleteFileFromAws");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, req.filePath + '/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage })

router.post('/api/add-book', upload.single('pdf'), async (req, res) => {
  console.log(req.filePath)
  const link = await uploadToAws.uploadFileToCloud(req.file.originalname, req.user.userId, req.filePath);
  console.log(link)
  const book = new Book({
    name: req.body.name,
    author: req.body.author,
    idBook: bookId.randomId(),
    creator: req.user.userId,
    link: link,
    fileName: req.file.originalname
  })
  console.log({body: req.body, file: req.file})
  book.save().then(() => res.send('Successful! Book saved!'))
    .catch((err) => console.log(err));
})

router.post('/api/delete-book', async (req, res) => {
  const findBook = await Book.find({idBook: req.body.idBook})
  console.log(findBook)
  await deleteFileFromCloud(findBook[0].fileName, findBook[0].creator)
  await Book.findOneAndDelete({idBook: req.body.idBook}, (err) => {
    if(err) console.log(err);
    res.json({message: 'Book succesfull deleted!'})
  });
})

router.get('/api/get-books', (req, res) => {
  Book.find().then((data) => res.json({items: data}))
    .catch((err) => console.log(err));
})

router.post('/api/user-books', (req, res) => {
  if (req.body.id === 0) return res.status(200);
  Book.find({creator: req.body.id}).then((data) => res.json({items: data}))
    .catch((err) => console.log(err));
})

router.post('/api/get-book', async (req, res) => {
  await Book.find({idBook: req.body.idBook}).then((data) => res.json({book: data[0]}))
    .catch((err) => console.log(err));
})
module.exports = router