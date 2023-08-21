const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');
const router = express.Router();

router.get('/signup', authController.getSignup);
router.get('/login', authController.getLogin);

router.post(
  '/signup',
  [
    body('first_name')
      .isAlpha()
      .withMessage('Please enter a valid first name.'),
    body('last_name').isAlpha().withMessage('Please enter a valid last name.'),
    body('nickname')
      .isAlphanumeric()
      .withMessage('Please enter a valid nickname.')
      .custom((value, { req }) => {
        return User.findOne({ nickname: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'Nickname exists already, please pick a different one.'
            );
          }
        });
      }),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'E-Mail exists already, please pick a different one.'
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 8 characters.'
    )
      .isLength({ min: 8 })
      .isAlphanumeric()
      .withMessage(
        'Please enter a password with only numbers and text and at least 8 characters.'
      )
      .trim(),
    body('confirm_password')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      }),
  ],
  authController.postSignup
);
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Password has to be valid.')
      .isLength({ min: 8 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

router.post('/logout', authController.postLogout);

module.exports = router;
