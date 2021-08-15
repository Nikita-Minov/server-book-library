const express = require('express');
const User = require("../models/User.js");
const bookId = require("../utils/randomId.js");
const passport = require("passport");
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const saltRounds = 10;
const router = express.Router();

passport.use(new LocalStrategy(
  function (username, password, cb) {
    console.log(username, password)
    User.findOne({username}, function (err, user) {
      if (err) {
        return cb(err);
      }
      if (!user) {
        console.log('Invalid username')
        return cb(null, false);
      }
      bcrypt.compare(password, user.password, function(err, result) {
        console.log(user.password)
        if(result) return cb(null, user);
        else return cb(null, false);
      });
    });
  }));

router.post('/api/register-account', async(req, res) => {
  await bcrypt.genSalt(saltRounds, async function(err, salt) {
    const user = new User({username: req.body.username, password: bcrypt.hashSync(req.body.password, salt), userId: bookId.randomId()})
    const userIsFinded = await User.find({username: req.body.username});
    if (userIsFinded.length !== 0) return res.json({message: 'Error! An account with the same name already exists!\n'})
    user.save().then(() => res.json({message: 'Succesfull! Account registered!'}))
      .catch((err) => console.log(err))
    console.log('Account saved!');
  });
})

router.post('/api/login', function (req, res, next) {
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
  console.log(req.filePath);
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
  req.logout();
  res.status(200).clearCookie('connect.sid', {path: '/'}).json({message: "Successful logout!"});
  console.log(req.user);
});

module.exports = router;