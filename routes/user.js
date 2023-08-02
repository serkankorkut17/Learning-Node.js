const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');

router.get('/', userController.getTweets);
router.post('/post-tweet', userController.postTweet);

module.exports = router;
