licExamGuru.controller("IndexController", function($scope, $rootScope, $cookies, $cookieStore, $http, licExamGuruApi, $indexedDB)
{

   $scope.init = function(){
      $indexedDB.openStore('users', function(store){
        store.getAll().then(function(member) {
            if(member == 0)
            {
               window.location.hash = "#/signup";
            }
            else if($.cookie('userid'))
            {
                if($.cookie('isPaid') != 'true')
                  window.location.hash = "#/licence";
                else
                  window.location = getUrl(url)+"home.html";
            }
            else
            {
               window.location.hash = "#/signin";
            }
        });
     });
   }
   $scope.init();

});

licExamGuru.controller("SigninController", function($scope, $rootScope, $cookies, $cookieStore, $http, licExamGuruApi, $indexedDB, dateFilter)
{
   $.backstretch("img/login-bg.jpg", {speed: 500});
   $scope.email = '';
   $scope.paddword = '';
   $scope.isSuccess = false;
   $scope.loginFailMsg = '';
   $scope.isLoginSction = true;
   $scope.isLicenceSection = false;
   $scope.data = [];
   $scope.showLicence = function(){
      var exp_date = $scope.dateFormat();
      if( $.cookie('userStatus') != 'paid' ||  $.cookie('userExpDate') > exp_date)
      {
         $scope.isLoginSction = false;
         $scope.isLicenceSection = true;
      }
   }
   $scope.dateFormat =  function(){
        var date = new Date();
        return dateFilter(date, 'yyyyMMdd');
   }
   $scope.login = function(){
    $scope.loginFailMsg = "Checking offline processing ...";
      $indexedDB.openStore('users', function(store){
        var query = store.QueryBulder().$index('email').$eq($scope.email);
        store.eachWhere(query).then(function(user){
          if(user){
            $.each(user, function(key, value){

                if(value.email ==  $scope.email && value.password.split('~-+-~')[1] == pass_decode($scope.password).split('~-+-~')[1])
                 {
                     $scope.loginFailMsg = "Login success processing ...";
                     $scope.isSuccess = true;
                     $.cookie('userid', value.id);
                     $.cookie('userName',value.name);
                     var today = $scope.dateFormat();
                     var exp_date = value.exp_date ? value.exp_date.replace(' ', '') : today;
                     if(value.status == 'paid' && exp_date.replace(' ', '') > today)
                     {
                          $.cookie('isPaid', 'true');
                     }else
                     {
                        value['status'] = 'free';
                        store.upsert(value);
                        $.cookie('isPaid', 'false');
                     }
                     
                    //window.location = getUrl(url)+"home.html";
                     window.location.hash = "#/";
                    
                 }
            });
            $scope.loginFailMsg = "Checking online processing ...";
          }
          if(navigator.onLine){
              licExamGuruApi.serverPost('check_user', data={email : $scope.email, password: $scope.password})
               .success(function(data){
                if(data['result']){  
                  $scope.loginFailMsg = "Login success processing ...";                    
                  $scope.isSuccess = true;
                  var user_data = [{
                    'id' : (data['result']['id']).toString(),
                    'name' : data['result']['name'],
                    'email' : data['result']['email'],
                    'mobile' : data['result']['mobile'],
                    'state' : data['result']['state'],
                    'city' : data['result']['city'],
                    'division' : data['result']['division'],
                    'password' : pass_decode(data['result']['password']),
                    'passwordtext' : pass_decode(data['result']['passwordtext'])
                 }];
                  $scope.user_data = user_data;
                  $scope.saveInDb();
                  $.cookie('userid', data['result']['id']);
                  $.cookie('userName',data['result']['name']);
                }
                else
                {
                  $scope.isSuccess = false;
                  $scope.loginFailMsg = "Email or password not match";
                }
              });
            } 
            else
            {
              $scope.isSuccess = false;
              $scope.loginFailMsg = "Email or password not match";
            }  
        });
     });
   }
   $scope.saveInDb = function()
   {
       $indexedDB.openStore('users', function(store){
        store.insert($scope.user_data);
        //window.location = getUrl(url)+"home.html";
         window.location.hash = "#/";
       });
   }
});

licExamGuru.controller("SignupController", function($scope, $rootScope, $cookies, $cookieStore, $http, licExamGuruApi, $indexedDB)
{
  $.backstretch("img/login-bg.jpg", {speed: 500});
   $scope.name =  '';
   $scope.email = '';
   $scope.mobile = '';
   $scope.state = '';
   $scope.city = '';
   $scope.division = '';
   $scope.paddword = '';
   $scope.passwordtext = '';
   $scope.errormsg = '';
   $scope.user_data = [];
   $scope.sugnup = function(){
      $indexedDB.openStore('users', function(store){
         store.count().then(function(count){
           var user_data = [{
              'id' : (parseInt(count)+1).toString(),
              'name' : $scope.name,
              'email' : $scope.email,
              'mobile' : $scope.mobile,
              'state' : $scope.state,
              'city' : $scope.city,
              'division' : $scope.division,
              'password' : $scope.password,
              'passwordtext' : $scope.passwordtext,
           }];
            // if(navigator.onLine){
               licExamGuruApi.serverPost('create_user', user_data[0])
               .success(function(data){
                if(data['success']){
                  $scope.isSuccess = false;
                  $scope.loginFailMsg = data['success'];
                  user_data[0]['password'] = pass_decode($scope.password);
                  user_data[0]['passwordtext'] = pass_decode($scope.passwordtext);
                  $scope.user_data = user_data;
                  $scope.saveInDb();
                }
                else
                {
                  $scope.isSuccess = false;
                  $scope.loginFailMsg = data['errormsg'];
                }
               });
             // }
             // else
             // {
             //    $scope.isSuccess = false;
             //    $scope.loginFailMsg = 'Net connection is required to create ne user';
             // }
          });
       });
     }

    $scope.saveInDb = function()
    {
       $indexedDB.openStore('users', function(store){
        store.insert($scope.user_data);
        window.location.hash = "#/";
       });
    }

});
licExamGuru.controller("LicenceController", function($scope, $rootScope, $cookies, $cookieStore, $http, licExamGuruApi, $indexedDB, dateFilter)
{
   $scope.licenceCode = '';
   $scope.locenceText = $.cookie('locenceText') ? $.cookie('locenceText') : create_licence_key();
   $.backstretch("img/login-bg.jpg", {speed: 500});
   $scope.isSuccess = false;
   $scope.loginFailMsg = '';
   $scope.dateFormat =  function(){
        var date = new Date();
        return dateFilter(date, 'yyyy MM dd');
   }
   $scope.dateFormat30 =  function(){
        var date = new Date();
        date.setTime(date.getTime()+ 30*24*60*60*1000);
        return dateFilter(date, 'yyyy MM dd');
   }
   $scope.licence = function()
   {
      $indexedDB.openStore('users', function(store){
        var query = store.QueryBulder().$index('id').$eq($.cookie('userid').toString());
        store.eachWhere(query).then(function(user){
          if(user){
            $.each(user, function(key, value){
                if(value.id == $.cookie('userid') && $scope.licenceCode == get_licence_value($scope.locenceText))
                {
                  value['status'] = 'paid';
                  value['exp_date'] = $scope.dateFormat30();
                  store.upsert(value);
                  $.cookie('isPaid', 'true');
                  $.removeCookie('locenceText');
                  window.location.hash = "#/";
                }
                else
                {
                  $scope.isSuccess = false;
                  $scope.loginFailMsg = 'Invalid Licence Code';
                }
            });
          }
        });
      });
   }

})
licExamGuru.controller("LogoutController", function($scope, $rootScope, $cookies, $cookieStore, $http, licExamGuruApi, $indexedDB)
{
  $.removeCookie('userid');
  $.removeCookie('url');
  $.removeCookie('isPaid');
  $.removeCookie('userName');
  window.location = url; 

})