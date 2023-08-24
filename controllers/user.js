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
      if (element.toString() === user._id.toString()) {
        tweet.liked = true;
      }
      user.savedTweets.find(element => {
        if (element.toString() === tweet._id.toString()) {
          tweet.saved = true;
        }
      });
    });
    tweet.likesNo = tweet.likes.length;
    tweet.commentsNo = tweet.comments.length;
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
      if (element.toString() === user._id.toString()) {
        tweet.liked = true;
      }
      user.savedTweets.find(element => {
        if (element.toString() === tweet._id.toString()) {
          tweet.saved = true;
        }
      });
    });
    tweet.likesNo = tweet.likes.length;
    tweet.commentsNo = tweet.comments.length;
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
  /* console.log(tweetId + ' ' + nickname + ' ' + user); */

  Tweet.findById(tweetId)
    .populate('creator')
    .then(tweet => {
      if (!tweet) {
        return new Error('No tweet found.');
      }
      tweet.likes.find(element => {
        if (element.toString() === user._id.toString()) {
          tweet.liked = true;
        }
      });
      tweet.likesNo = tweet.likes.length;
      tweet.commentsNo = tweet.comments.length;

      user.savedTweets.find(element => {
        if (element.toString() === tweet._id.toString()) {
          tweet.saved = true;
        }
      });

      /* console.log(tweet); */
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

      const found = tweet.likes.find(element => element.toString() === userId);
      if (found) {
        tweet.likes.remove(found);
        res.status(200).json({ action: 'unlike', likes: tweet.likes.length });
      } else {
        tweet.likes.push(user._id);
        res.status(200).json({ action: 'like', likes: tweet.likes.length });
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

exports.saveTweet = (req, res, next) => {
  const tweetId = req.tweetId;
  const user = req.user;
  const userId = user._id.toString();

  Tweet.findById(tweetId)
    .then(tweet => {
      if (!tweet) {
        return new Error('No tweet found.');
      }

      const found = user.savedTweets.find(
        element => element.toString() === tweetId
      );
      if (found) {
        user.savedTweets.remove(found);
        res.status(200).json({ action: 'unsave' });
      } else {
        user.savedTweets.push(tweetId);
        res.status(200).json({ action: 'save' });
      }
      /* console.log(tweet); */
      user.save();
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getSavedTweets = async (req, res, next) => {
  const user = req.user;
  const tweets = await Tweet.find({ _id: { $in: user.savedTweets } })
    .populate('creator')
    .sort({ createdAt: -1 });
  /* console.log(tweets); */

  tweets.forEach(tweet => {
    tweet.likes.find(element => {
      if (element.toString() === user._id.toString()) {
        tweet.liked = true;
      }
      user.savedTweets.find(element => {
        if (element.toString() === tweet._id.toString()) {
          tweet.saved = true;
        }
      });
    });
    tweet.likesNo = tweet.likes.length;
    tweet.commentsNo = tweet.comments.length;
  });

  res.render('saved', {
    pageTitle: 'Twitter - Saved Tweets',
    path: '/saved',
    tweets: tweets,
  });
};
