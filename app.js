const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const errorController = require('./controllers/error');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const isAuth = require('./middleware/is-auth');
const User = require('./models/user');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(cookieParser());

const MONGODB_URI =
  'mongodb+srv://serkankorkut:118909Gs.@serkan.dipkqr1.mongodb.net/test';

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    const dateStr = new Date().toISOString().replace(/:/g, '-');
    cb(null, dateStr + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
    /* cookie: { secure: true }, */
  })
);
app.use((req, res, next) => {
  console.log('middleware-2');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use((req, res, next) => {
  console.log('middleware-1');
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.darkMode = req.cookies.darkMode === 'true' ? true : false;
  res.locals.user = req.user;
  next();
});

app.post('/dark-mode', (req, res, next) => {
  req.cookies.darkMode === 'true'
    ? res.cookie('darkMode', false)
    : res.cookie('darkMode', true);
  //res.clearCookie('darkMode');
  backURL = req.header('Referer') || '/';
  res.redirect(backURL);
});

/* app.get('/', (req, res, next) => {
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
}); */

app.use(authRoutes);
app.use(userRoutes);
app.get('/500', errorController.get500);
app.use('/404', errorController.get404);

app.all('*', function (req, res) {
  res.redirect('/404');
});

/* app.use((error, req, res, next) => {
  //res.status(error.httpStatusCode).render(...);
  res.redirect('/500');
    res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: false,
  });
}); */

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
