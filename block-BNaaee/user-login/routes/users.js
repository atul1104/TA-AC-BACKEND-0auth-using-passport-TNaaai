var express = require('express');
var { render } = require('../app.js');
var router = express.Router();
var bcrypt = require('bcrypt');
var passport = require('passport');
var User = require('../models/User');
var { ensureAuthenticated } = require('../config/auth.js');

//login handle
router.get('/', ensureAuthenticated, function (req, res, next) {
  res.render('user', { user: req.user });
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

//Register handle
router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res) => {
  var { name, email, password, password2 } = req.body;
  let errors = [];
  console.log(' Name ' + name + ' email :' + email + ' pass:' + password);
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  //check if match
  if (password !== password2) {
    errors.push({ msg: 'passwords dont match' });
  }

  //check if password is more than 6 characters
  if (password.length < 6) {
    errors.push({ msg: 'password atleast 6 characters' });
  }
  if (errors.length > 0) {
    res.render('register', {
      errors: errors,
      name: name,
      email: email,
      password: password,
      password2: password2,
    });
  } else {
    //validation passed
    User.findOne({ email: email }).exec((err, user) => {
      console.log(user);
      if (user) {
        errors.push({ msg: 'email already registered' });
        res.render('register', { errors, name, email, password, password2 });
      } else {
        var newUser = new User({
          name: name,
          email: email,
          password: password,
        });

        //hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //save pass to hash
            newUser.password = hash;
            //save user
            newUser
              .save()
              .then((value) => {
                console.log(value);
                req.flash('success_msg', 'You have now registered!');
                res.redirect('/users/login');
              })
              .catch((value) => console.log(value));
          })
        );
      }
    });
  }
});

//logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Now logged out');
  res.redirect('/users/login');
});

module.exports = router;
