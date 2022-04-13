var express = require('express');
var router = express.Router();
var passport = require('passport');
var { ensureAuthenticated } = require('../config/auth.js');
var passportGoogle = require('../modules/google');
var passportGitHub = require('../modules/github');

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Passport' });
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  console.log(req);
  res.render('dashboard', {
    user: req.user,
  });
});

/* GOOGLE ROUTER */
router.get(
  '/google',
  passportGoogle.authenticate('google', {
    scope: 'https://www.google.com/m8/feeds',
  })
);

router.get(
  '/google/callback',
  passportGoogle.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/dashboard');
  }
);

/* GITHUB ROUTER */
router.get('/github', passportGitHub.authenticate('github'));

router.get(
  '/github/callback',
  passportGitHub.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  }
);
module.exports = router;
