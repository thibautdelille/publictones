var Workflow = require('../../../utilities/workflow')
, email = require('../../../utilities/email')
, config = require('../../../config.json')
, User = require('../../../controller/user');

exports.init = function(req, res){
  //are we logged in?
  if (req.isAuthenticated()) { 
    res.redirect(req.user.defaultReturnUrl());
  }
  else {
    res.render('login/forgot/index', { title: 'Forgot your Password?',
      email: '',
      message:''
  });
  }
};

exports.send = function(req, res){
  console.log('req.body.email:'+req.body.email);
  var workflow = new Workflow(req, res);
  
  workflow.on('validate', function() {
    if (!req.body.email) {
      workflow.outcome.errfor.email = 'required';
      return workflow.emit('response')
    }
    
    workflow.emit('patchUser');
  });
  
  workflow.on('patchUser', function() {
    //create new reset token
    var token = require('crypto').createHash('md5').update(Math.random().toString()).digest('hex');
    
    //find the user with that email and patch
    User.forgotPassword(req.body.email, token, function(err, user) {
      if (err) return workflow.emit('exception', err);
      
      if (!user) {
        workflow.outcome.errors.push('Email address not found.');
        return workflow.emit('response');
      }
      
      workflow.emit('sendEmail', token, user);
    })
/*
    req.app.db.models.User.findOneAndUpdate({ email: req.body.email }, { resetPasswordToken: token }, function(err, user) {
      if (err) return workflow.emit('exception', err);
      
      if (!user) {
        workflow.outcome.errors.push('Email address not found.');
        return workflow.emit('response');
      }
      
      workflow.emit('sendEmail', token, user);
    });*/
  });
  
  workflow.on('sendEmail', function(token, user) {
    email(req, res, {
      from: req.app.get('email-from-name') +' <'+ req.app.get('email-from-address') +'>',
      to: user.email,
      subject: 'Reset your PublicTones password',
      textPath: 'login/forgot/email-text',
      htmlPath: 'login/forgot/email-html',
      locals: {
        username: user.username,
        resetLink: 'http://'+ req.headers.host +'/login/reset/'+ token +'/',
        projectName: req.app.get('project-name')
      },
      success: function(message) {
        workflow.emit('response');
      },
      error: function(err) {
        workflow.outcome.errors.push('Error Sending: '+ err);
        workflow.emit('response');
      }
    });
  });
  
  workflow.emit('validate');
};