const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tweetSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
    comments: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tweet', tweetSchema);
