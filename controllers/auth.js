const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const fileHelper = require('../util/file');

exports.getSignup = (req, res, next) => {
  res.render('signup', {
    pageTitle: 'Signup',
    path: '/signup',
    oldInput: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    errorMessage: '',
    validationErrors: [],
  });
};

exports.getLogin = (req, res, next) => {
  res.render('login', {
    pageTitle: 'Login',
    path: '/login',
    oldInput: {
      email: '',
      password: '',
    },
    errorMessage: '',
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const image = req.file;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirm_password;

  if (!image) {
    return res.status(422).render('signup', {
      pageTitle: 'Signup',
      path: '/signup',
      oldInput: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: [],
    });
  }

  const errors = validationResult(req);
  console.log(errors.array());

  const imageUrl = image.path;
  if (!errors.isEmpty()) {
    fileHelper.deleteFile(imageUrl);
    return res.status(422).render('signup', {
      pageTitle: 'Signup',
      path: '/lsignup',
      oldInput: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      errorMessage: '' /* errors.array()[0].msg */,
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        firstName: firstName,
        lastName: lastName,
        imageUrl: imageUrl,
        email: email,
        password: hashedPassword,
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('login', {
      path: '/login',
      pageTitle: 'Login',
      oldInput: {
        email: email,
        password: password,
      },
      errorMessage: '' /* errors.array()[0].msg */,
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(422).render('login', {
          pageTitle: 'Login',
          path: '/login',
          oldInput: {
            email: email,
            password: password,
          },
          errorMessage: 'Invalid email or password.',
          validationErrors: [],
        });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log('loginErr: ' + err);
              res.redirect('/');
            });
          }
          return res.status(422).render('login', {
            path: '/login',
            pageTitle: 'Login',
            oldInput: {
              email: email,
              password: password,
            },
            errorMessage: 'Invalid email or password.',
            validationErrors: [],
          });
        })
        .catch(err => {
          //console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    //console.log(err);
    res.redirect('/');
  });
};
