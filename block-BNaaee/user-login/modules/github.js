var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var bcrypt = require('bcrypt');
var User = require('../models/User');

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    //match user
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          return done(null, false, {
            message: 'that email is not registered',
          });
        }
        //match pass
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;

          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'pass incorrect' });
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  })
);
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: '/auth/github/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOrCreate(
        { userid: profile.id },
        { name: profile.displayName, userid: profile.id },
        function (err, user) {
          return done(err, user);
        }
      );
    }
  )
);

module.exports = passport;
