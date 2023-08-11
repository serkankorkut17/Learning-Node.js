const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');

router.get('/', isAuth, userController.getTweets);
router.post('/post-tweet', isAuth, userController.postTweet);

router.get('/one-tweet/', isAuth, userController.getOneTweet);

module.exports = router;
