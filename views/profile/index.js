var config = require('../../config')
  , utils = require('../../utils')
  , User = require('../../controller/user')
  , Station = require('../../controller/station')
  , Tone = require('../../controller/tone')
  , Like = require('../../controller/like')
  , Friendship = require('../../controller/friendship');

exports.init = function (req, res){
  // get the user
  User.getUserByUrl(req.params.username, function(err, data){
    if(err) res.send(data);
    if((!data)||(data===undefined)){
      res.redirect('/404/');
    } else{
      var user_profile = data;

      console.log("user_profile.username:"+user_profile.username);
      console.log("user_profile.avatar:"+user_profile.avatar);
      // get the stations the user created
      Station.getStationsByUser(user_profile, function(err, data){
        if(err) res.send(data);
        user_profile.stations = data;

        // get the tones of the user connected
        Tone.getTonesByUser(user_profile, function(err, data){
          if(err) res.send(data);
          user_profile.tones = data;

          // get the Likes of the user connected
          Like.addLikesInTonesByUsers(req.user, user_profile.tones, function(err, data){
            if(err)res.send(data);
            user_profile.tones = data;

            // get the Likes of the user connected
            Like.getLikesByUser(user_profile, function(err, data){
              if(err) res.send(data);
              user_profile.likes = data;

              Station.getCurrentStationbyId(user_profile.current_station, function(err, data){
                if(err) res.send(data);

                user_profile.station = data;

                //get the friendship status between user_profile and user connected
                Friendship.getFriendshipByUsers(req.user._id,user_profile._id, function(err, data){
                  if(err) res.send(data);

                  var friendship = data
                  Friendship.getFriendsByUser(user_profile._id, req.user._id, function(err, data, request, pending){

                    if(err) res.send(data);

                    user_profile.friends = data;
                    user_profile.request = request;
                    user_profile.pending = pending;

                    //get notification
                    Station.getStationsWithFriends(user_profile, req.user._id, function(err, data){

                    if(err) res.send(data);

                    console.log('[view/profile] init:getStationsWithFriends:'+data);

                    req.user.avatar = utils.getAvatar(req.user.email);

                    stationsWithFriends = data;
                      res.render('profile', {
                        title: user_profile.username,
                        user_profile: user_profile,
                        user: req.user,
                        friendship: friendship,
                        stationsWithFriends: stationsWithFriends
                      });
                    })
                  });
                }); 
              });
            });
          });
        });
      });
    }
  });
}


exports.sendfriendship = function (req, res){
  Friendship.sendFriendship(req.body.user1_id, req.body.user2_id, function(err, data){
    if(err) res.send({"error":1});
    data.error = 0;
    res.send(data);
  });
}

exports.search = function (req, res){
  User.search(req.query.s, function(err, data){
    if(err) res.send({"error":1});
    data.error = 0;
    res.send(data);
  });
}