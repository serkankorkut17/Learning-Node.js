const mongoose = require('mongoose');
const Tweet = require('../models/tweet');
const fileHelper = require('../util/file');
const User = require('../models/user');

exports.getTweets = async (req, res, next) => {
  const tweets = await Tweet.find().populate('creator').sort({ createdAt: -1 });
  const user = req.user;
  /* console.log(tweets); */

  tweets.forEach(tweet => {
    tweet.likes.find(element => {
      if (element.userId.toString() === user._id.toString()) {
        tweet.liked = true;
      }
    });
    tweet.likesNo = tweet.likes.length;
  });

  if (req.session.isLoggedIn) {
    res.render('tweets', {
      pageTitle: 'Twitter',
      path: '/',
      tweets: tweets,
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
  const user = req.user;
  const userProfile = await User.findOne({ nickname: userNickname });
  const tweets = await Tweet.find({ creator: user })
    .populate('creator')
    .sort({ createdAt: -1 });
  /* console.log(tweets); */

  tweets.forEach(tweet => {
    tweet.likes.find(element => {
      if (element.userId.toString() === user._id.toString()) {
        tweet.liked = true;
      }
    });
    tweet.likesNo = tweet.likes.length;
  });

  res.render('profile', {
    pageTitle: 'Twitter - My Profile',
    path: '/' + userNickname,
    tweets: tweets,
    userProfile: userProfile,
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
      tweet.likes.find(element => {
        if (element.userId.toString() === user._id.toString()) {
          tweet.liked = true;
        }
      });
      tweet.likesNo = tweet.likes.length;

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

exports.likeTweet = (req, res, next) => {
  const tweetId = req.tweetId;
  const user = req.user;
  const userId = user._id.toString();

  Tweet.findById(tweetId)
    .then(tweet => {
      if (!tweet) {
        return new Error('No tweet found.');
      }

      const found = tweet.likes.find(
        element => element.userId.toString() === userId
      );
      if (found) {
        tweet.likes.remove(found);
        res.status(200).json({ action: 'unlike' });
      } else {
        tweet.likes.push({ userId: user._id });
        res.status(200).json({ action: 'like' });
      }
      /* console.log(tweet); */
      tweet.save();
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
