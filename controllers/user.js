const mongoose = require('mongoose');
const Tweet = require('../models/tweet');
const fileHelper = require('../util/file');

exports.getTweets = async (req, res, next) => {
  const tweets = await Tweet.find().populate('creator').sort({ createdAt: -1 });
  console.log(tweets);

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

exports.getOneTweet = async (req, res, next) => {
  const tweets = await Tweet.find().populate('creator').sort({ createdAt: -1 });
  res.render('tweet', {
    pageTitle: 'Twitter',
    path: '/one-tweet/',
    tweet: tweets[1],
  });
};
