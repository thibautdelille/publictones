var config = require('../../config')
  , utils = require('../../utils')
  , Station = require('../../controller/station')
  , User = require('../../controller/user')
  , Like = require('../../controller/like');

exports.init = function (req, res){
  Station.getStationByUrl(req.params.username, req.params.title, function(err, data){
    if(err)res.send(data);
    station = data;
    Station.getInfosStation(req.user, station, function(err, data){
      if(err)res.send(data);
      station = data.station;
      user = data.user;
      Like.addLikesInTonesByUsers(user, station.tones, function(err, tones){
        if(err)res.send(data);
        station.tones = tones;
        res.render('station', {
          title: 'station - '+station.title,
          user: user,
          station: station
        });
      });
    });
  });
}

exports.createstation = function (req, res){
  Station.createStation(req.body, req.user, function(err, data){
    if(err) res.send(data);
    var station = data;
    res.send({"error":0, "station_url":station.url, "user_url":req.user.url});
  });
}

exports.redirectStation = function (req, res){
  Station.getStationById(req.params.id, function(err, data){
    if(err)res.send(data);
    var station = data;
    User.getUserById(station.id_user_create, function(err, data){
      if(err)res.send(data);
      var user = data;
      res.redirect('/'+user.url+'/s/'+station.url);
    });
  });
}