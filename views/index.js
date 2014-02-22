exports.init = function(req, res){
  console.log('/ init');
  if(req.isAuthenticated()){
    res.redirect('/'+req.user.url);
  } else{
    res.render('index', { title: 'PublicTones'});
  }
};