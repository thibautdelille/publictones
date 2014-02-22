/*
 * Module dependencies
 */

var config = require('./config')
  , utils = require('./utils')
  , User = require('./providers/user').User
  , Station = require('./providers/station').Station;

exports = module.exports = function(app, passport) {

  //front end
  app.get('/', require('./views/index').init);

  // login/out
  app.get('/login', require('./views/login').init);
  app.get('/login/', require('./views/login').init);
  app.post('/login', require('./views/login').login);
  app.post('/login/', require('./views/login').login);
  app.get('/login-failure', require('./views/login').loginfailure);
  app.get('/login-failure/', require('./views/login').loginfailure);
  app.get('/login/forgot/', require('./views/login/forgot/index').init);
  app.post('/login/forgot/', require('./views/login/forgot/index').send);
  app.get('/login/reset/', require('./views/login/reset/index').init);
  app.get('/login/reset/:token/', require('./views/login/reset/index').init);
  app.put('/login/reset/:token/', require('./views/login/reset/index').set);
  app.get('/logout', require('./views/logout/index').init);
  app.get('/logout/', require('./views/logout/index').init);

  //sign up
  app.get('/signup', require('./views/signup/index').init);
  app.get('/signup/', require('./views/signup/index').init);
  app.post('/signup', require('./views/signup/index').signup);
  app.post('/signup/', require('./views/signup/index').signup);
  app.post('/check-username', require('./views/signup/index').checkusername);
  app.post('/check-email', require('./views/signup/index').checkemail);
/*
  app.get('/auth/facebook', passport.authenticate('facebook', { callbackURL: config.auth.facebook.callback }));
  app.get('/auth/facebook/callback', require('./views/signup/index').signupFacebook);
*/
  app.get('/404/', require('./views/http/index').http404);

  // profile page
  app.get('/:username', utils.restrict, require('./views/profile/index').init);
  app.get('/:username/', utils.restrict, require('./views/profile/index').init);

  // station
  app.get('/:username/s/:title', utils.restrict, require('./views/station/index').init);
  app.get('/:username/s/:title/', utils.restrict, require('./views/station/index').init);

  // modal actions
  app.post('/station/create', utils.restrict, require('./views/station/index').createstation);
  app.get('/station/:id', utils.restrict, require('./views/station/index').redirectStation);

  // modal actions
  app.post('/tone/like', utils.restrict, require('./views/tone/index').like);
  app.post('/tone/unlike', utils.restrict, require('./views/tone/index').unlike);

  app.post('/profile/sendfriendship', utils.restrict, require('./views/profile/index').sendfriendship);

  app.get('/api/users', utils.restrict, require('./views/profile/index').search);

}