$(document).ready(function(){
	var email_verify = false;
	$('input').bind('focus', function(){
		$(this).parent().parent().removeClass('error');
	})

	function validEmail(){
		email_verify = false;
		if($("input.email").val()!=''){
			if(IsEmail($("input.email").val())){
				$(".email-group .help-inline span").css('display', 'none');
				$(".email-group .success").css('display', 'block');
			}else{
				$(".email-group .help-inline span").css('display', 'none');
				$(".email-group .error").css('display', 'block');
			}
		}else{
			$(".email-group .help-inline span").css('display', 'none');
			$(".email-group .required").css('display', 'block');
		}
	}

	$("input.email").keyup(function() {
		window.setTimeout(function(){
			validEmail();
		}, 40);
	});

	function init_forgot(){
		if($("input.email").val()!=''){
			validEmail();
		}else{
			$("input.email").focus();
		}
	}

	init_forgot();

	$('form').submit(function() {
		if($(".email-group .success").css('display') == 'block'){

			if(!email_verify){
				$.ajax({ 
					type: "POST",
					url: "/check-email",
					data: 'email='+$("input.email").val(), 
					dataType: "json",
					success: function(data){ 
						if(data.error == 0){
							$(".email-group .help-inline span").css('display', 'none');
							$(".email-group .exist").css('display', 'block');
							$("input.email").focus();
						}else{
							console.log('submit');
							email_verify = true;
							$('form').submit();
							//init_signup();
						}
					}
				});
				//init_signup();
				return false;
			}
		}else{
			//init_signup();
			return false;
		}
	});
});