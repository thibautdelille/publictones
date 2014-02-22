


(function( $ ){
	var defaultSettings =  {
      'url' : '/api/users?s='
    };
  var methods = {
    init : function( options ) {
    	
      var self = this;
    	// THIS 
    	$(this).data('options.tsearch', $.extend(this, defaultSettings, options));
    	
    	var options = $(this).data('options');

      $(this).css('display', 'none');
      
      $("input#search").keyup(function() {
        window.setTimeout(function(){
          console.log($("input").val());
          if($("input").val() == ""){
            $('.self').html('');
          }else{
            $(self).tsearchuser('search');
          }
        }, 40);
      });

      $('form.navbar-search').submit(function() {
        //$(self).tsearchuser('search');
        return false;
      });

      $('input#search').on('focus', function(){
          if($("input#search").val() != ""){
            $(self).tsearchuser('search');
          }
      });
    },

    search : function(){
      var self = this;
      var options = $(this).data('options.tsearchuser');
      var search_input = $("input#search").val();
      $.ajax({
        dataType: "json",
        url: '/api/users?s='+search_input,
        success: function(data){
          $(self).tsearchuser('result', data);
        }
      });
    },

    result : function(data){
      var self = this;
      var items = [];
      var list = $('<div/>', {
        'class': 'module'
      });
      $(self).html(list);
      $.each(data, function(key, val) {
        var dataItem = {};
        dataItem.id =  dataItem._id = val._id;
        dataItem.thumb =  "/images/avatar.jpg";
        dataItem.fullname =  val.fullname;
        dataItem.username =  val.username;
        dataItem.url =  val.username;
        dataItem.avatar =  val.avatar;
        var item = ich.usersearch(dataItem);
        list.append(item);
      });
      $(self).css('display', 'block');
      if($('.modal-backdrop').length == 0){
        var backdrop = $('<div/>', {'class': 'modal-backdrop'});
        $('body').append(backdrop)
        backdrop.addClass('fade');
        backdrop.addClass('out');
        window.setTimeout(function(){
          backdrop.removeClass('out');
          backdrop.addClass('in');
        },50);
        backdrop.bind('click',function(){
          $(self).tsearchuser('hide');
        })
      }
      list.addClass('img-rounded');
      $('.tone', self).each(function(){
        $(this).tsearchuseritem();
      });

    },

    hide : function(){
      var self = this;
      var backdrop = $('.modal-backdrop');
      backdrop.removeClass('in');
      backdrop.addClass('out');
      $(self).css('display', 'none');
      window.setTimeout(function(){
        backdrop.remove();
      },200);
    }
  };
  $.fn.tsearchuser = function( method ) {
    
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on tsearch' );
    }    
  
  };

})( jQuery );