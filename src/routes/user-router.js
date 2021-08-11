const express = require('express');
const User = require("../models/User.js");
const bookId = require("../utils/randomId.js");
const passport = require("passport");
const router = express.Router();

router.post('/api/register-account', async(req, res) => {
  res.set("Access-Control-Allow-Origin", "*")
  res.set("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS")
  res.set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
  const user = new User({username: req.body.username, password: req.body.password, userId: bookId.randomId()})
  const userIsFinded = await User.find({username: req.body.username});
  if (userIsFinded.length !== 0) return res.json({message: 'Error! An account with the same name already exists!\n'})
  user.save().then(() => res.json({message: 'Succesfull! Account registered!'}))
    .catch((err) => console.log(err))
  console.log('Account saved!');
})

router.post('/api/login', function (req, res, next) {
  res.set("Access-Control-Allow-Origin", "*")
  res.set("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS")
  res.set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
  passport.authenticate('local', function (err, user) {
    console.log(user);
    if (!user) {
      res.json({message: 'Error! User is not found!'})
    } else {
      req.login(user, function (err) {
        if (err) {
          console.log(err);
          return;
        }
        res.json({
          message: "Successful authorization!",
          id: req.user.id
        })
      });
    }
  })(req, res, next);
});

router.get('/api/me', function (req, res) {
  res.set("Access-Control-Allow-Origin", "*")
  res.set("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS")
  res.set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
  if (req.user == null) {
    res.json({
      message: 'User is not found!'
    })
  } else {
    res.json({
      message: 'User found!',
      username: req.user.username,
      id: req.user.userId
    });
  }
})

router.get('/api/logout', function (req, res) {
  res.set("Access-Control-Allow-Origin", "*")
  res.set("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS")
  res.set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
  req.logout();
  res.status(200).clearCookie('connect.sid', {path: '/'}).json({message: "Successful logout!"});
  console.log(req.user);
});

module.exports = router;