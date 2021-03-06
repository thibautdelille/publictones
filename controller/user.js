var User = require('../providers/user').User;
var utils = require('../utils');

exports.getUserById = function(user_id, fn){
  User.findById(user_id).exec(function(err, user){
    if(err) {
      fn(err, {"error":"[user] getUserById: An error has occurred"});
    }else{
      if(user!=undefined){
        user.avatar = utils.getAvatar(user.email);
      }
      fn(err, user);
    }
  });
}

exports.getUserByUsername = function(username, fn){
  User.find({'username':username}).exec(function(err, users){
    if(err) {
      fn(err, {"error":"[user] getUserByUsername: An error has occurred"});
    }else{
      if(users[0]!=undefined){
        users[0].avatar = utils.getAvatar(users[0].email);
      }
      fn(err, users[0]);
    }
  });
}

exports.getUserByEmail = function(email, fn){
  User.find({'email':email}).exec(function(err, users){
    if(err) {
      fn(err, {"error":"[user] getUserByEmail: An error has occurred"});
    }else{
      if(users[0]!=undefined){
        users[0].avatar = utils.getAvatar(users[0].email);
      }
      fn(err, users[0]);
    }
  });
}

exports.getUserByUrl = function(user_url, fn){
    console.log("getUserByUrl"+user_url);
  if(user_url == "undefined"){
        fn(true, {"error":"[user] getUserByUrl: An error has occurred"});
  }else{
    User.find({'url':user_url}).exec(function(err, users){
      if(err) {
        fn(err, {"error":"[user] getUserByUrl: An error has occurred"});
      }else{
        if(users[0]!=undefined){
          users[0].avatar = utils.getAvatar(users[0].email);
        }
    		fn(err, users[0]);
    	}
    });
  }
}

exports.getInfosUserInStation = function(user, station, fn){
  var user_id = user._id;
  if(station.archives){
    for(var i=0;i<station.archives.users.length;i++){
      var temp_id = station.archives.users[i].id;
      if(user_id+'' === temp_id+''){
        user.nb_tones = station.archives.users[i].nb_tones;
        return fn(false, user); 
      }
    }
  }
  if(station.users){
	  for(var i=0;i<station.users.length;i++){
	    var temp_id = station.users[i].id;
	    if(user_id+'' === temp_id+''){
	      user.nb_tones = station.users[i].nb_tones;
	      return fn(false, user); 
	    }
	  }
  }
  user.nb_tones = station.nb_tones;
  return fn(false, user); 
}

exports.getUsersByIds = function(users_id, fn){
  User.find().where('_id').in(users_id).exec(function(err, users){
    if(err) {
    	fn(err, {"error":"[user] findListByIds: An error has occurred"});
    }else{
	  	for(var i = 0; i < users.length; i++){
        if(users[i]!=undefined){
          users[i].avatar = utils.getAvatar(users[i].email);
        }
	      users[i].password = '';
	    }
	    fn(err, users);
	}
  })
}


exports.getUsersByStation = function(station, fn){
  if(station.users){
	  var data = station.users;
	  var users_id = [];
	  for(var i = 0; i < data.length; i++){
	    users_id.push(data[i].id)
	  }
	  exports.getUsersByIds(users_id, fn);
  }else{
  	fn(false, []);
  }
}

exports.createUser = function(data, fn){
  //test if the username already exist
  switch(true){
    case !data.username:
      fn(true, {"error":"[user] createUser: username required"});
      break;
    case !/^[a-zA-Z0-9\-\_]+$/.test(data.username):
      fn(true, {"error":"[user] createUser: only use letters, numbers, \'-\', \'_\'"});
      break;
    case !data.email:
      fn(true, {"error":"[user] createUser: username required"});
      break;
    case !/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(data.email):
      fn(true, {"error":"[user] createUser: invalid email format"});
      break;
  }

  //return if we have errors already
  exports.getUserByUsername(data.username, function(err, doc){
    if(err) {
      fn(err, doc);
    }else{
      if(doc){
        fn(true, {"error":"[user] createUser: this username is already taken"});
      }else{
        // Hoorah the username doesn't exist

        //test if the email already exist
        exports.getUserByEmail(data.email, function(err, doc){
          if(err) {
            fn(err, doc);
          }else{
            if(doc){
              fn(true, {"error":"[user] createUser: there already a profile with this email"});
            }else{
              // Hoorah the email doesn't exist
              var user = new User({
                fullname:data.fullname,
                username:data.username,
                url:data.username.replace(/\s+/g, '-').toLowerCase(),
                email:data.email
              });
              user.password = user.encodePassword(data.password)
              user.save(function(err, user){
                if(err){ 
                  fn(err, "[user] createUser: couldn't create user")
                }
                fn(err, user);
              });
            }
          }
        });
      }
    }
  });
}

exports.search = function(data, fn){
  var regex = new RegExp(data, 'i');
  console.log("User search:"+regex);
  User.find({ $or:[{fullname: regex }, { username: regex }]}, 'fullname url username email avatar').limit(20).exec(function(err, users){
    var datas = [];
    for(var i = 0; i < users.length; i++){
      var user = {
         '_id': users[i]._id,
         'fullname': users[i].fullname,
         'username': users[i].username,
         'url': users[i].url, 
         'avatar': utils.getAvatar(users[i].email) 
      };
      users[i] = user;
    }
    fn(err, users);
  });
}

exports.forgotPassword = function(email, token, fn){
  User.findOneAndUpdate({ email: email }, { resetPasswordToken: token }, function(err, user) {
    console.log('User forgotPassword:'+user);
    fn(err, user);
  });
}