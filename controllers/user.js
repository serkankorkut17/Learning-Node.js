const mongoose = require('mongoose');
const Tweet = require('../models/tweet');
const fileHelper = require('../util/file');
const User = require('../models/user');
const user = require('../models/user');

exports.getTweets = async (req, res, next) => {
  const tweets = await Tweet.find().populate('creator').sort({ createdAt: -1 });
  /* console.log(tweets); */

  if (req.session.isLoggedIn) {
    res.render('tweets', {
      pageTitle: 'Twitter',
      path: '/',
      /*      oldInput: {
        tweet_content: '',
      }, */
      tweets: tweets,
      /*       errorMessage: '',
      validationErrors: [], */
    });
  } else {
    res.render('main', {
      pageTitle: 'Twitter',
      path: '/',
    });
  }
};

exports.postTweet = (req, res, next) => {
  const tweetContent = req.body.tweet_content;
  const image = req.file;
  let tweet = null;
  if (image) {
    let imageUrl = image.path;
    fileHelper.moveFile(imageUrl, 'images/tweets/' + image.filename);
    imageUrl = 'images/tweets/' + image.filename;
    tweet = new Tweet({
      content: tweetContent,
      creator: req.user,
      imageUrl: imageUrl,
    });
  } else {
    tweet = new Tweet({
      content: tweetContent,
      creator: req.user,
    });
  }

  tweet
    .save()
    .then(result => {
      res.redirect('/');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProfile = async (req, res, next) => {
  const userNickname = req.userNickname;
  const user = await User.findOne({ nickname: userNickname });
  const tweets = await Tweet.find({ creator: user })
    .populate('creator')
    .sort({ createdAt: -1 });
  /* console.log(tweets); */

  res.render('profile', {
    pageTitle: 'Twitter - My Profile',
    path: '/' + userNickname,
    tweets: tweets,
    userProfile: user,
  });
};

exports.getUsers = async (req, res, next) => {
  const users = await User.find().sort({ createdAt: -1 });
  /* console.log(users); */

  res.render('users', {
    pageTitle: 'Twitter - Users',
    path: '/users',
    users: users,
  });
};

exports.getOneTweet = (req, res, next) => {
  const tweetId = req.tweetId;
  const user = req.user;
  const nickname = req.userNickname;
  console.log(tweetId + ' ' + nickname + ' ' + user);

  Tweet.findById(tweetId)
    .populate('creator')
    .then(tweet => {
      if (!tweet) {
        return new Error('No tweet found.');
      }
      console.log(tweet);
      res.render('tweet', {
        pageTitle: 'Twitter',
        path: '/' + nickname + '/' + tweetId,
        tweet: tweet,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
