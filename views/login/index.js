var config = require('../../config')
  , Workflow = require('../../utilities/workflow');

exports.init = function (req, res){
  res.render('login', 
  { 
    title: 'Sign in to PublicTones',
    message: ''
  });
};

exports.login = function (req, res){
  console.log("/login")
  var workflow = new Workflow(req, res);
  
  workflow.on('validate', function() {
    if (!req.body.email) workflow.outcome.errfor.email = 'required';
    if (!req.body.password) workflow.outcome.errfor.password = 'required';
    
    //return if we have errors already
    if (workflow.hasErrors()) res.redirect('/login-failure/');
    
    workflow.emit('attemptLogin');
  });
  
  workflow.on('attemptLogin', function() {
    req._passport.instance.authenticate('local', function(err, user, info) {
          console.log("user : "+user);
      if (err) res.redirect('/login-failure/');
      if (!user) {
        workflow.outcome.errors.push('Username and password combination not found or your account is inactive.');
        res.redirect('/login-failure/');
      }
      else {
        req.login(user, function(err) {
          console.log("user Login ");
          if (err) return workflow.emit('exception', err);
          
          res.redirect('/');
        });
      }
    })(req, res);
  });
  
  workflow.emit('validate');
};


exports.loginfailure = function (req, res){
  console.log('/login-failure');
    res.render('login', 
    { 
      title: 'Houston we have a problem!',
      message: config.message.login_invalid
    });
}