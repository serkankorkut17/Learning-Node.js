module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    console.log('wtf');
    return res.redirect('/login');
  }
  next();
};
