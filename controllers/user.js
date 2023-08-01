exports.getTweets = (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.render('tweets', {
      pageTitle: 'Twitter',
      path: '/',
      oldInput: {
        tweet_content: '',
      },
      errorMessage: '',
      validationErrors: [],
    });
  } else {
    res.render('main', {
      pageTitle: 'Twitter',
      path: '/',
    });
  }
};

/* exports.postTweet = (req, res, next) => {}; */
