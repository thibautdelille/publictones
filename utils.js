var md5 = require('MD5');

/*
 * Restrict paths
 */

exports.restrict = function(req, res, next){
  if(req.isAuthenticated()) next();
  else res.redirect('/');
};

/*
 * Sort Case Insensitive
 */

exports.caseInsensitiveSort = function (a, b) { 
   var ret = 0;

   a = a.toLowerCase();
   b = b.toLowerCase();

   if(a > b) ret = 1;
   if(a < b) ret = -1; 

   return ret;
};

/*
 * Generate Avatar
 * Using Gravatar API
 */

exports.getAvatar = function (email) { 
	console.log('getAvatar - email:'+email);
	var avatar = "http://www.gravatar.com/avatar/"+md5(email.toLowerCase())+"?d=http%3A%2F%2Fpublictones.com%2Fimages%2Favatar.jpg"
	console.log('getAvatar - avatar:'+avatar);
	return avatar;
};