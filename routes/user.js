const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');
const User = require('../models/user');
const Tweet = require('../models/tweet');
const mongoose = require('mongoose');

router.get('/', isAuth, (req, res, next) => {
  res.redirect('/home');
});
router.get('/home', isAuth, userController.getTweets);
router.post('/post-tweet', isAuth, userController.postTweet);

router.get('/users', isAuth, userController.getUsers);

router.param('userNickname', (req, res, next, userNickname) => {
  console.log('Fetching user with nickname: ' + userNickname);
  req.userNickname = userNickname;
  User.findOne({ nickname: userNickname }).then(user => {
    if (!user) {
      return res.redirect('/home');
      // return new Error('No user found.');
    }
  });
  next();
});
router.get('/:userNickname', isAuth, userController.getProfile);

router.param('tweetId', (req, res, next, tweetId) => {
  console.log('Fetching tweet with id: ' + tweetId);
  req.tweetId = tweetId;
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    return res.redirect('/home');
  }
  Tweet.findById(tweetId).then(tweet => {
    if (!tweet) {
      return res.redirect('/home');
      // return new Error('No tweet found.');
    }
  });
  next();
});
router.get('/:userNickname/:tweetId', isAuth, userController.getOneTweet);

router.post('/:userNickname/:tweetId/like', isAuth, userController.likeTweet);

module.exports = router;
