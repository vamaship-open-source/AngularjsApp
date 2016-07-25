var apiurl = "http://achieveee.com/examguru/app/v1/";
//var apiurl = "http://licexamapp.dev/app/v1/";
var password_encode = ['e','f','g','G','E','I','J','K','J','h','i','j','k','7','8','9','a','b','c','d','e','f','g','h','m','1','2','3','4','5','6','n','1','2','3','4','5','6','7','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','M','N','0','1','2','3','4','5','T','U','V','W','X','Y','Z','0','1','2','3','4','8','9','o','i','j','k','l','5','6','7','6','7','8','9','O','P','Q','R','S','8','9'];
var password_decode = ['D','E','F','4','5','I','J','K','J','r','s','t','u','v','h','i','j','d','e','f','g','h','m','1','k','7','8','9','a','b','c','2','3','4','5','6','n','1','2','3','4','5','6','7','e','f','g','G','E','p','q','w','x','y','z','0','1','2','3','4','5','6','7','8','9','A','B','C','T','U','V','W','X','Y','Z','0','1','2','3','4','8','9','o','i','j','k','l','5','6','7','6','7','8','9','O','P','Q','R','S','M','N','0','1','2','3','8','9'];
var password_special = ['!','#','$','@','%','^','&','*','~','-'];
var password_encodetest = [];
for(i = 0; i< 10; i++)
password_encodetest[i] = ['1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','i','j','k','l','m','n','1','2','3','4','5','6','7','8','9','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','E','I','J','K','J','M','N','0','1','2','3','4','5','6','7','8','9','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'];
var url = $.cookie('url') ? $.cookie('url') : window.location.href;
$.cookie('url', url);
function validate(){
	//if($.cookie('userid') && $.cookie('isPaid') != true){ window.location.hash = "#/licence";}
	if(!$.cookie('userid') && url != window.location.href){window.location=url;}
	if($.cookie('examtime'))
	{
		var Endtime = parseInt($.cookie('examtime')) + 60 * 60 * 1000;
		var date = new Date();
		var nowtime = date.getTime();
		if(nowtime < Endtime)
		{
			window.location = $.cookie('examurl');
		}
		else
		{
			$.removeCookie('examtime');
			$.removeCookie('examurl');
		}
	}
}
function getUrl(url)
{
	if(url)
	{
	  var url1 = url.split('/');
	  for(i =0 ; i < url1.length; i++)
	  {
	      if(url1[i].indexOf('.html') > 0)
	      {
	        url = url.replace(url1[i], '');
	      }
	  }
	}
	return url;
}
function create_licence_key()
{
	var licence_key = '';
	for(i = 0; i < 4; i++){
		var key_index =  parseInt(Math.random() * 10);
		var value_index =  parseInt(Math.random() * 100);
		licence_key = licence_key +(licence_key == '' ? '':'-')+key_index+""+value_index;
	}
	if(licence_key.length != 15)
	  create_licence_key();
	$.cookie('locenceText' , licence_key);
	return licence_key;
}
function get_licence_value(licence_key)
{
	var text = '';
	licence_key = licence_key.split('-');
	var key = [];
	for(var i = 0 ; i < licence_key.length ; i++)
	{
		key[i] = [];
		for(var j = 0; j < licence_key[i].length ; j++)
		{
			key[i][j] = licence_key[i].substr(j,1);
		}
		for(var j =0 ; j< key[i].length-1; j++)
		{

			for(var l = j ; l < key[i].length-1 ; l++)
			{
				text = text+""+password_encodetest[licence_key[i].substr(0,1)][parseInt(key[i][j]*10)+parseInt(key[i][l+1])];
			}
		}
	}
	console.log(text);
	return text;
}

function pass_decode(password)
{
	var text = '';
	for(var i = 0; i < password.length; i++)
	{
		if(password_encode.indexOf(password.substr(i,1)) >= 0)
		{
			text = text + ""+password_decode[password_encode.indexOf(password.substr(i,1))]
		}
		else
		{
			text = text+""+password.substr(i,1);
		}
		text = i < parseInt(password.length -1) ? text+"&&" : text;
	}
	var text1 = ''
	for(var i = 0; i <50; i++)
	{
		var random = parseInt(Math.random() * 10);
		text1 = text1+""+password_special[random];
	}
	return text1+""+'~-+-~'+text;
}

function readURL(input) {
  if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
          $(input).parent().parent().find('img').attr('src', e.target.result);
      }

      reader.readAsDataURL(input.files[0]);
  }
}

validate();
var licExamGuru = angular.module('licExamGuru', ['ngRoute','indexedDB', 'ngCookies'])
	.config( [
	    '$compileProvider',
	    function( $compileProvider )
	    {   
	        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
	        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
	    }
	])
	.config(function ($indexedDBProvider) {
	    $indexedDBProvider
	      .connection('LicExamGuru')
	      .upgradeDatabase(2, function(event, db, tx){
				var objStore = db.createObjectStore('acount_table', {keyPath: 'id'});
				objStore.createIndex('id', 'id', {unique: true});
				objStore.createIndex('member_id', 'member_id', {unique: false});
				objStore.createIndex('message', 'message', {unique: false});
				objStore.createIndex('status', 'status', {unique: false});
				objStore.createIndex('credit_id', 'credit_id', {unique: false});
				objStore.createIndex('devid_id', 'devid_id', {unique: false});
				objStore.createIndex('credit_amt', 'credit_amt', {unique: false});
				objStore.createIndex('devid_amt', 'devid_amt', {unique: false});
				objStore.createIndex('credit_date', 'credit_date', {unique: false});
				objStore.createIndex('devid_date', 'devid_date', {unique: false});

				var objStore = db.createObjectStore('activation', {keyPath: 'id'});
				objStore.createIndex('id', 'id', {unique: true});
				objStore.createIndex('member', 'member', {unique: false});
				objStore.createIndex('amount', 'amount', {unique: false});

				var objStore = db.createObjectStore('admin_acount', {keyPath: 'id'});
				objStore.createIndex('id', 'id', {unique: true});
				objStore.createIndex('dealer_id', 'dealer_id', {unique: false});
				objStore.createIndex('amount', 'amount', {unique: false});
				objStore.createIndex('transfer_date', 'transfer_date', {unique: false});

				var objStore = db.createObjectStore('demo_table', {keyPath: 'id'});
				objStore.createIndex('id', 'id', {unique: true});
				objStore.createIndex('name', 'name', {unique: false});
				objStore.createIndex('email', 'email', {unique: false});
				objStore.createIndex('mobile', 'mobile', {unique: false});
				objStore.createIndex('demotype', 'demotype', {unique: false});
				objStore.createIndex('typeval', 'typeval', {unique: false});
				objStore.createIndex('created_at', 'created_at', {unique: false});
				objStore.createIndex('demo_result', 'demo_result', {unique: false});

				var objStore = db.createObjectStore('exam_table', {keyPath: 'id'});
				objStore.createIndex('id', 'id', {unique: true});
				objStore.createIndex('member', 'member', {unique: false});
				objStore.createIndex('model_id', 'model_id', {unique: false});
				objStore.createIndex('exam_type', 'exam_type', {unique: false});
				objStore.createIndex('exam_date', 'exam_date', {unique: false});
				objStore.createIndex('questions', 'questions', {unique: false});
				objStore.createIndex('attempt', 'attempt', {unique: false});
				objStore.createIndex('unattenpt', 'unattenpt', {unique: false});
				objStore.createIndex('correct', 'correct', {unique: false});
				objStore.createIndex('wrong', 'wrong', {unique: false});
				objStore.createIndex('result', 'result', {unique: false});
				objStore.createIndex('status', 'status', {unique: false});

				var objStore = db.createObjectStore('game_table', {keyPath: 'id'});
				objStore.createIndex('id', 'id', {unique: true});
				objStore.createIndex('member', 'member', {unique: false});
				objStore.createIndex('model_id', 'model_id', {unique: false});
				objStore.createIndex('game_type', 'game_type', {unique: false});
				objStore.createIndex('play_date', 'play_date', {unique: false});
				objStore.createIndex('points', 'points', {unique: false});

				var objStore = db.createObjectStore('users', {keyPath: 'id'});
				objStore.createIndex('id', 'id', {unique: true});
				objStore.createIndex('email', 'email', {unique: false});
				objStore.createIndex('name', 'name', {unique: false});
				objStore.createIndex('mobile', 'mobile', {unique: false});
				objStore.createIndex('password', 'password', {unique: false});
				objStore.createIndex('passwordtext', 'passwordtext', {unique: false});
				objStore.createIndex('state', 'state', {unique: false});
				objStore.createIndex('city', 'city', {unique: false});
				objStore.createIndex('division', 'division', {unique: false});
				objStore.createIndex('member_type', 'member_type', {unique: false});
				objStore.createIndex('parent_id', 'parent_id', {unique: false});
				objStore.createIndex('created_at', 'created_at', {unique: false});
				objStore.createIndex('updated_at', 'updated_at', {unique: false});
				objStore.createIndex('status', 'status', {unique: false});
				objStore.createIndex('start_date', 'start_date', {unique: false});
				objStore.createIndex('exp_date', 'exp_date', {unique: false});
				objStore.createIndex('profile_photo', 'profile_photo', {unique: false});
				objStore.createIndex('banner_photo', 'banner_photo', {unique: false});
				objStore.createIndex('verification', 'verification', {unique: false});
				objStore.createIndex('acount_val', 'acount_val', {unique: false});

				var objStore = db.createObjectStore('meratial', {keyPath: 'id'});
				objStore.createIndex('id', 'id', {unique: true});
				objStore.createIndex('name', 'name', {unique: false});
				objStore.createIndex('type', 'type', {unique: false});
				objStore.createIndex('metarial_id', 'metarial_id', {unique: false});

				var objStore = db.createObjectStore('model_paper', {keyPath: 'id'});
				objStore.createIndex('id', 'id', {unique: true,});
				objStore.createIndex('name', 'name', {unique: false});
				objStore.createIndex('type', 'type', {unique: false});
				objStore.createIndex('module_id', 'module_id', {unique: false});

				var objStore = db.createObjectStore('newquestion', {keyPath: 'id'});
				objStore.createIndex('id', 'id', {unique: true});
				objStore.createIndex('question', 'question', {unique: false});
				objStore.createIndex('option1', 'option1', {unique: false});
				objStore.createIndex('option2', 'option2', {unique: false});
				objStore.createIndex('option3', 'option3', {unique: false});
				objStore.createIndex('option4', 'option4', {unique: false});
				objStore.createIndex('correct_opt', 'correct_opt', {unique: false});
				objStore.createIndex('type', 'type', {unique: false});
				objStore.createIndex('module_id', 'module_id', {unique: false});

				var objStore = db.createObjectStore('notification', {keyPath: 'id'});
				objStore.createIndex('id', 'id', {unique: true});
				objStore.createIndex('member_id', 'member_id', {unique: false});
				objStore.createIndex('message', 'message', {unique: false});
				objStore.createIndex('create_date', 'create_date', {unique: false});
				objStore.createIndex('status', 'status', {unique: false});

				var objStore = db.createObjectStore('oldquestion', {keyPath: 'id'});
				objStore.createIndex('id', 'id', {unique: true});
				objStore.createIndex('question', 'question', {unique: false});
				objStore.createIndex('option1', 'option1', {unique: false});
				objStore.createIndex('option2', 'option2', {unique: false});
				objStore.createIndex('option3', 'option3', {unique: false});
				objStore.createIndex('option4', 'option4', {unique: false});
				objStore.createIndex('correct_opt', 'correct_opt', {unique: false});
				objStore.createIndex('type', 'type', {unique: false});
				objStore.createIndex('module_id', 'module_id', {unique: false});
				objStore.createIndex('status', 'status', {unique: false});

				var objStore = db.createObjectStore('payment', {keyPath: 'id'});
				objStore.createIndex('id', 'id', {unique: true});
				objStore.createIndex('cust_id', 'cust_id', {unique: false});
				objStore.createIndex('invoice', 'invoice', {unique: false});
				objStore.createIndex('token', 'token', {unique: false});
				objStore.createIndex('payer_id', 'payer_id', {unique: false});
				objStore.createIndex('plan_id', 'plan_id', {unique: false});
				objStore.createIndex('plan', 'plan', {unique: false});
				objStore.createIndex('plan_amt', 'plan_amt', {unique: false});
				objStore.createIndex('conversions', 'conversions', {unique: false});
				objStore.createIndex('conversion_used', 'conversion_used', {unique: false});
				objStore.createIndex('transaction_id', 'transaction_id', {unique: false});
				objStore.createIndex('transaction_type', 'transaction_type', {unique: false});
				objStore.createIndex('payment_type', 'payment_type', {unique: false});
				objStore.createIndex('amt', 'amt', {unique: false});
				objStore.createIndex('feeamt', 'feeamt', {unique: false});
				objStore.createIndex('payment_status', 'payment_status', {unique: false});
				objStore.createIndex('name', 'name', {unique: false});
				objStore.createIndex('country', 'country', {unique: false});
				objStore.createIndex('state', 'state', {unique: false});
				objStore.createIndex('city', 'city', {unique: false});
				objStore.createIndex('address', 'address', {unique: false});
				objStore.createIndex('zipcode', 'zipcode', {unique: false});
				objStore.createIndex('start_date', 'start_date', {unique: false});
				objStore.createIndex('end_date', 'end_date', {unique: false});
				objStore.createIndex('created_at', 'created_at', {unique: false});
				objStore.createIndex('updated_at', 'updated_at', {unique: false});

				var objStore = db.createObjectStore('question', {keyPath: 'id'});
				objStore.createIndex('id', 'id', {unique: true});
				objStore.createIndex('question', 'question', {unique: false});
				objStore.createIndex('option1', 'option1', {unique: false});
				objStore.createIndex('option2', 'option2', {unique: false});
				objStore.createIndex('option3', 'option3', {unique: false});
				objStore.createIndex('option4', 'option4', {unique: false});
				objStore.createIndex('correct_opt', 'correct_opt', {unique: false});
				objStore.createIndex('type', 'type', {unique: false});
				objStore.createIndex('module_id', 'module_id', {unique: false});

				var objStore = db.createObjectStore('analytics', {keyPath: 'id'});
				objStore.createIndex('id', 'id', {unique: true});
				objStore.createIndex('userid', 'userid', {unique: false});
				objStore.createIndex('modelId', 'modelId', {unique: false});
				objStore.createIndex('type', 'type', {unique: false});
				objStore.createIndex('language', 'language', {unique: false});
				objStore.createIndex('open', 'open', {unique: false});
				objStore.createIndex('clicks', 'clicks', {unique: false});
				objStore.createIndex('correct', 'correct', {unique: false});
				objStore.createIndex('wrong', 'wrong', {unique: false});

	      });
	  });
licExamGuru.run(function($rootScope) {
    $rootScope.isExam = false;
    $rootScope.language = $.cookie('language') ? $.cookie('language') : 'h';
    $rootScope.profile_photo = $.cookie('profile_photo') ? $.cookie('profile_photo') :'';
})

licExamGuru.factory('licExamGuruApi', function($http) {
	return {
		serverPost: function(url, data) {
			return $http({
						url: apiurl+url,
						method: 'POST',
						data : data		
					});				
		},
		serverGet: function(url, data) {
			return $http({
						url: apiurl+url,
						method: 'POST',
						data : data		
					});				
		},
		password_encode: function(password)
		{

		}
	}
});


