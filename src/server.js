const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User.js');
const session = require('cookie-session');
const dotenv = require('dotenv').config();

// Routes
const userRouter = require('./routes/user-router');
const bookRouter = require('./routes/book-router');

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionSuccessStatus: 200
}

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
      if (user.password != password) {
        console.log(user.password);
        console.log(password);
        console.log('Invalid password');
        return cb(null, false);
      }
      return cb(null, user);
    });
  }));


passport.serializeUser(function (user, done) {
  done(null, user.userId);
  console.log('Serialize')
});

passport.deserializeUser(function (userId, done) {
  User.findOne({userId}, function (err, user) {
    if (err) {
      return done(err);
    }
    console.log(user);
    console.log('Deserialize')
    done(null, user);
  });
});

const app = express();
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({extended: false}));
app.use(userRouter);
app.use(bookRouter);
mongoose.connect(process.env.DBURL, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('DB connected');
});

app.listen(process.env.PORT, () => {
  console.log('Server has been started on port ' + process.env.PORT);
})