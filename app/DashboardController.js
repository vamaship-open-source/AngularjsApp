licExamGuru.controller("DashboardController", function($scope, $rootScope, $cookies, $cookieStore, $http, licExamGuruApi, $indexedDB,dateFilter)
{
   if(!$.cookie('userid')){window.location=url;}
   validate();

    angular.element('#top_menu').scope().paperOption(false);
   $scope.data = [];
   $scope.analytics = {
        'exam':{
            open : 0,
            clicks : 0,
            correct : 0,
            wrong : 0,
            per : 0,
            msg : ''
           }, 
           'watch' : {
              open : 0,
              clicks : 0,
              correct : 0,
              wrong : 0,
              per : 0,
              msg : ''
           }
        };
   $scope.updateLocalStorage = function()
    {
     licExamGuruApi.serverGet('getData', {})
         .success(function(data){
            $scope.data = data['result'];
            var table = $scope.data['meratial'].table;
            console.log(table);
            $indexedDB.openStore(table.toString(), function(store){
               for(j = 0; j < $scope.data['meratial']['recdatacount']; j++){
                  store.insert($scope.data['meratial']['recdata'][j]);
              }
            });
            var table = $scope.data['model_paper'].table;
            $indexedDB.openStore(table.toString(), function(store){
               for(j = 0; j < $scope.data['model_paper']['recdatacount']; j++){
                  store.insert($scope.data['model_paper']['recdata'][j]);
              }
            });
            var table = $scope.data['question'].table;
            $indexedDB.openStore(table.toString(), function(store){
               for(j = 0; j < $scope.data['question']['recdatacount']; j++){
                  store.insert($scope.data['question']['recdata'][j]);
              }
            });
           
         });
       
   }
   // $scope.updateLocalStorage();
   $indexedDB.openStore('question', function(store){
        store.count().then(function(count){
          if(count <=0)
          $scope.updateLocalStorage();
        });
    });
   
   $scope.loadData = function(){
      $indexedDB.openStore('analytics', function(store){
          var query = store.QueryBulder().$index('language').$eq($rootScope.language);
            store.eachWhere(query).then(function(data){
              $.each(data, function(key, value){
                if($.cookie('userid') == value['userid'])
                {
                  $scope.analytics[value['type']]['open'] = parseInt($scope.analytics[value['type']]['open']) + parseInt(value['open']);
                  $scope.analytics[value['type']]['clicks'] = parseInt($scope.analytics[value['type']]['clicks']) + parseInt(value['clicks']);
                  $scope.analytics[value['type']]['correct'] = parseInt($scope.analytics[value['type']]['correct']) + parseInt(value['correct']);
                  $scope.analytics[value['type']]['wrong'] = parseInt($scope.analytics[value['type']]['wrong']) + parseInt(value['wrong']);
                  var per =parseInt(( parseInt( $scope.analytics[value['type']]['correct'])/ parseInt( $scope.analytics[value['type']]['clicks'])) * 100);
                  $scope.analytics[value['type']]['per'] = per;
                  if(per <= 40)
                  {
                   $scope.analytics[value['type']]['msg'] = " This is too low for attempt exam.";
                  }
                  else if (per <= 60)
                  {
                   $scope.analytics[value['type']]['msg'] = " This is avarage you can attempt exam.";
                  }
                  else
                  {
                    $scope.analytics[value['type']]['msg'] = " this is good you are ready to attempt exam";
                  }
                }
              });

          });
     });
   }
  $scope.dateFormat =  function(){
        var date = new Date();
        return dateFilter(date, 'yyyyMMdd');
   }
   $scope.check_exp_date = function()
   {
     $indexedDB.openStore('users', function(store){
        var query = store.QueryBulder().$index('id').$eq($.cookie('userid').toString());
        store.eachWhere(query).then(function(user){
          if(user){
            $.each(user, function(key, value){
               var today = $scope.dateFormat();
               var exp_date = value.exp_date ? value.exp_date.replace(' ', '') : today;
              if(value.id == $.cookie('userid') && exp_date.replace(' ', '') < today)
                {
                  value['status'] = 'free';
                  store.upsert(value);
                  $.cookie('isPaid', 'false');
                  $.removeCookie('locenceText');
                  window.location.hash = "#/";
                }
                
            });
          }
        });
    });
   }
  $scope.check_exp_date(); 
  $scope.loadData();
});

licExamGuru.controller("NavbarTopController", function($scope, $rootScope, $cookies, $cookieStore, $http, licExamGuruApi, $routeParams, $indexedDB)
{
    $scope.logoutUrl = getUrl(url);
    $scope.model = $routeParams.model;
    $scope.module_id = $routeParams.module_id; 
    $scope.showpaterOption = false;
    $scope.isExam = '';
    $scope.paperOption = function(status){
      $scope.showpaterOption = status;
      $scope.model = $routeParams.model;
      $scope.module_id = $routeParams.module_id; 
      $scope.isExam = $routeParams.exam;
      if($scope.isExam) {
        $scope.showpaterOption = false;
        $rootScope.isExam = true;
      }
    }
    $scope.withoutAns = function(){
      angular.element('#modelPaper').scope().showAns = false; 
      angular.element('#modelPaper').scope().showOption = true;
      $("body").find('input').prop('disabled', false);  
    }
    $scope.withAns = function(){
      angular.element('#modelPaper').scope().showAns = true; 
      angular.element('#modelPaper').scope().showOption = true;
      setTimeout(function() {$("body").find('input').prop('disabled', true);  }, 10);
      
    }
    $scope.onlyAns = function(){
      angular.element('#modelPaper').scope().showAns = true; 
      angular.element('#modelPaper').scope().showOption = false;  
    }
     $scope.languageChange = function(language)
    {
      $rootScope.language = language;
      $.cookie('language' , language);
      window.location =  window.location = getUrl(url)+"home.html";
      //angular.element("#nav-accordion").scope().loadMenu();
    }
});

licExamGuru.controller("NavbarLeftController", function($scope, $rootScope, $cookies, $cookieStore, $http, licExamGuruApi, $routeParams, $indexedDB)
{
    $scope.hindiModel;
    $scope.englishModel;
    $scope.hindiPdf;
    $scope.englishPdf;
    $scope.profile_photo;
    $scope.userName = $.cookie('userName');
    $scope.loadMenu = function(){
      $indexedDB.openStore('model_paper', function(store){
          var query = store.QueryBulder().$index('type').$eq($rootScope.language);
          store.eachWhere(query).then(function(data){
            for(i = 0; i < data.length; i++)
            {
               data[i]['id'] = parseInt(data[i]['id']);
            }
            $scope.hindiModel = data;
           });
       });

      $indexedDB.openStore('meratial', function(store){
          var query2 = store.QueryBulder().$index('type').$eq($rootScope.language);
          store.eachWhere(query2).then(function(data){
            for(i = 0; i < data.length; i++)
            {
                data[i]['id'] = parseInt(data[i]['id']);
            }
            $scope.hindiPdf = data;
           });
       });
      $indexedDB.openStore('users', function(store){
        var query = store.QueryBulder().$index('id').$eq($.cookie('userid'));
        store.eachWhere(query).then(function(data){
          $scope.profile_photo = data[0].profile_photo;
        })
    });
    }
    $scope.getProfile = function(profile_photo)
    {
      $scope.profile_photo = profile_photo;
    }
    $scope.loadMenu();
});

licExamGuru.controller("ExamHeaderController", function($scope, $rootScope, $cookies, $cookieStore, $http, licExamGuruApi, $routeParams, $indexedDB)
{
  var date = new Date();
  $scope.total = 50;
  $scope.attempt = 0;
  $scope.remaning = 50;
   if($.cookie('examtime') && $cookieStore.get('data'))
   {
      $scope.examdata = $cookieStore.get('data');
      for(i = 0; i < $scope.examdata.length; i++)
       {
          if($scope.examdata[i][1] != 0){
            $scope.attempt++;
            $scope.remaning--;

          }
       }
    }
  if(!$.cookie('examtime'))
  {
    $scope.examtime = date.getTime()
    $.cookie('examtime',$scope.examtime);
    $.cookie('examurl', window.location.href);
  }
  $scope.minuts = 59 - parseInt(parseInt(date.getTime() - parseInt($.cookie('examtime'))) / 60000);
  $scope.second = 60 - parseInt(parseInt(date.getTime() - parseInt($.cookie('examtime')))/1000) % 60;
  $scope.timer = function()
  {
    setTimeout(function() {
      var date = new Date();
      $scope.minuts = 59 - parseInt(parseInt(date.getTime() - parseInt($.cookie('examtime'))) / 60000);
      $scope.second = 60 - parseInt(parseInt(date.getTime() - parseInt($.cookie('examtime')))/1000) % 60;
      if(parseInt($scope.minuts) <= 0 && parseInt($scope.second) <= 1)
      {
        $scope.minuts = 0;
        $scope.second = 0;
        $("body").find('input').prop('disabled', true);
        angular.element('#modelPaper').scope().submitExam("Your time is over, bellow is the details of your exam, click on submit");
        $.removeCookie('examtime');
        $.removeCookie('examurl');
        return false;
      }
      $scope.minuts = $scope.minuts < 10 ? '0'+$scope.minuts : $scope.minuts;
      $scope.second = $scope.second < 10 ? '0'+$scope.second : $scope.second;
      $("#timertime").html("<span class='examlabel'>Time (MM:SS) : "+$scope.minuts+" : "+ $scope.second+"</span>");
     
      $scope.timer();
    }, 1000);
  }

  $scope.submitExam = function(){
    angular.element('#modelPaper').scope().submitExam("You have yet time for submit exam, if you are sure to submit then click on submit");
    //$("#modelPaper").find('input').attr('disabled', true);
  }

  $scope.attemptExam = function(attempt)
  {
      $scope.attempt = attempt;
      $scope.remaning = $scope.total - attempt;
      var doughnutData = [
            {
              value: $scope.attempt ,
              color:"#68dff0"
            },
            {
              value : $scope.remaning,
              color : "#fdfdfd"
            }
          ];
      var myDoughnut = new Chart(document.getElementById("serverstatus01").getContext("2d")).Doughnut(doughnutData);
  }
  $scope.timer();
  $scope.attemptExam($scope.attempt);
});

licExamGuru.controller("ModelpaperController", function($scope, $rootScope, $cookies, $cookieStore, $http, licExamGuruApi, $routeParams, $indexedDB, dateFilter)
{
    $scope.model = $routeParams.model == 'hindi' ? 'h' : 'e'; 
    $scope.module_id = $routeParams.module_id; 
    $scope.count = 1;
    $scope.loading = true;
    $scope.showAns  = false;
    $scope.showOption = true;
    $scope.examdata = [];
    $scope.attempt = 0;
    $scope.remaning = 50;
    $scope.remaningtime = 0;
    $scope.submitTitle = '';
    $scope.analyticsData = [];
    $indexedDB.openStore('question', function(store){
        var query = store.QueryBulder().$index('module_id').$eq($scope.module_id);
        store.eachWhere(query).then(function(data){
          if($.cookie('examtime') && $cookieStore.get('data'))
             $scope.examdata = $cookieStore.get('data');
          for(i = 0; i < data.length ; i++)
          {
              if(!$.cookie('examtime'))
              {
                $scope.examdata[i] = ['2', '0','0'];
              }
              //data[i]['id'] = parseInt(data[i]['id']);
              data[i]['checked'] =  $scope.examdata[i][0];
              data[i]['clicked'] =  $scope.examdata[i][1];
          }
          $scope.modelPaper = data;
          $scope.loading = false;  
          $scope.isExam = $routeParams.exam;
          // if($scope.isExam) {
           $cookieStore.put('data', $scope.examdata);

          // }
           angular.element('#top_menu').scope().paperOption(true);
          
         });
       
     });

    $scope.analytics = function(){
      $indexedDB.openStore('analytics', function(store){
       //store.clear();
       store.getAll().then(function(result){
               var data = {
                      id   : (parseInt(result.length)+1).toString(),
                      userid   : $.cookie('userid'),
                      modelId  : $scope.module_id,
                      type   : $routeParams.exam ? 'exam' : 'watch',
                      language   : $rootScope.language,
                      open   : '1',
                      clicks   : '0',
                      correct  : '0',
                      wrong  : '0'
                };
              var  find = false;
              $.each(result, function(key, value){
                if(value['userid'] == data['userid'] && value['modelId'] == data['modelId'] && value['type'] == data['type'] && value['language'] == data['language'])
                {
                  value['open'] = (parseInt(value['open'])+1).toString();
                  $scope.analyticsData = value;
                  store.upsert(value);
                  find = true;
                }
              });
              if(!find)
              {
                store.insert(data);
                $scope.analyticsData = data;
              }
        });
        });
    }
   
    $scope.analytics();
    $scope.onCheck = function(index, opt, ans, i)
    {
       var examdata = $cookieStore.get('data');
       if($routeParams.exam)
       {
          if(examdata[index][2] == 1 && opt.trim() != ans.trim())
          {
              $scope.analyticsData['correct'] = parseInt($scope.analyticsData['correct']) - 1;
              $scope.analyticsData['wrong'] = parseInt($scope.analyticsData['wrong']) + 1;
          }
          else if(examdata[index][2] == 2  && opt.trim() == ans.trim())
          {
              $scope.analyticsData['correct'] = parseInt($scope.analyticsData['correct']) + 1;
              $scope.analyticsData['wrong'] = parseInt($scope.analyticsData['wrong']) - 1;
          }
          else if(examdata[index][2] == 0)
          {
             if(opt.trim() == ans.trim())
             {
                $scope.analyticsData['correct'] = parseInt($scope.analyticsData['correct']) + 1;  
             }
             else
             {
                $scope.analyticsData['wrong'] = parseInt($scope.analyticsData['wrong']) + 1;
             }
             $scope.analyticsData['clicks'] = parseInt($scope.analyticsData['clicks']) + 1;
          }

       }
       else
       { 
           $scope.analyticsData['clicks'] = parseInt($scope.analyticsData['clicks'])+1;
           $scope.analyticsData['correct'] = parseInt($scope.analyticsData['correct']) +  (opt.trim() == ans.trim() ? 1 : 0);
           $scope.analyticsData['wrong'] = parseInt($scope.analyticsData['wrong']) +  (opt.trim() == ans.trim() ? 0 : 1);
       }
       $indexedDB.openStore('analytics', function(store){
           store.upsert($scope.analyticsData);
       });
       examdata[index][0] = $scope.modelPaper[index]['checked'] = opt.trim() == ans.trim() ? 1 : 0;
       examdata[index][1] = $scope.modelPaper[index]['clicked'] = i;
       examdata[index][2] = opt.trim() == ans.trim() ? 1 : 2;
       $scope.examdata = examdata;
       $scope.isExam = $routeParams.exam;
          if($scope.isExam) {
           $cookieStore.put('data', $scope.examdata);
           var count = 0;
           for(i = 0; i < $scope.examdata.length; i++)
           {
              if($scope.examdata[i][1] != 0){
                count++;
              }
           }            
            angular.element('#top_menu').scope().attemptExam(count);
          }
    }

    $scope.submitExam = function(title)
    {
        $scope.submitTitle = title;
        $cookieStore.put('data', $scope.examdata);
           var count = 0;
           for(i = 0; i < $scope.examdata.length; i++)
           {
              if($scope.examdata[i][1] != 0){
                count++;
              }
           }
          $scope.attempt = count;
          $scope.remaning = 50 - count;
          var date = new Date();
          var minuts = 59 - parseInt(parseInt(date.getTime() - parseInt($.cookie('examtime'))) / 60000);
          var second = 60 - parseInt(parseInt(date.getTime() - parseInt($.cookie('examtime')))/1000) % 60;
          $scope.remaningtime = minuts +" : "+second;
        $("#myModal").modal('show');
    }

  $scope.finalSubmit = function()
  {     
      $indexedDB.openStore('exam_table', function(store){
           store.count().then(function(count){
            var date = new Date();
            var created_at = dateFilter(date, 'dd MMM yyyy');
            var count = 0;
             for(i = 0; i < $scope.examdata.length; i++)
             {
                  if($scope.examdata[i][2] == 1){
                    count++;
                  }
             }
            var data = {'id': (parseInt(count)+1).toString(),
                'member': $.cookie('userid'),
                'model_id': $scope.module_id,
                'exam_type': $rootScope.language,
                'exam_date': created_at,
                'questions': '50',
                'attempt': $scope.attempt,
                'unattenpt': $scope.remaning,
                'correct': count,
                'wrong':  $scope.attempt - count,
                'result': $scope.examdata,
                'status': 'active',
          }
          store.insert(data);
          $.removeCookie('examtime');
          $.removeCookie('examurl');
          window.location =  getUrl(url)+"home.html";
        });
     });
  }
});

licExamGuru.controller("MetarialController", function($scope, $rootScope, $cookies, $cookieStore, $http, licExamGuruApi, $routeParams, $indexedDB)
{
    $scope.metarialname = $routeParams.name;
    angular.element('#top_menu').scope().paperOption(false);
   // $scope.metarialname = 'js/ViewerJS/#pdfsyllabus/'+$scope.metarialname+'.pdf'
    $scope.metarialname = getUrl(url)+'/pdfsyllabus/'+$scope.metarialname+'.pdf'

});


licExamGuru.controller("AnalyticsController", function($scope, $rootScope, $cookies, $cookieStore, $http, licExamGuruApi, $routeParams, $indexedDB)
{
    $scope.type = $routeParams.type;
    $scope.model = $routeParams.model;
    $scope.report = [];
    $indexedDB.openStore('analytics', function(store){
        var query = store.QueryBulder().$index('userid').$eq($.cookie('userid'));
        store.eachWhere(query).then(function(data){
          var i = 0;
          $.each(data, function(key, value){
            if($rootScope.language == value['language'] && $scope.type == value['type']){
              value['per'] = parseInt(parseInt(value['correct'])/ parseInt(value['clicks']) *100);
              $scope.report[i++] = value; 
            }
          });
        });
    });
});


licExamGuru.controller("ReportController", function($scope, $rootScope, $cookies, $cookieStore, $http, licExamGuruApi, $routeParams, $indexedDB)
{
   $scope.result = [];
    $indexedDB.openStore('exam_table', function(store){
        var query = store.QueryBulder().$index('member').$eq($.cookie('userid'));
        store.eachWhere(query).then(function(data){
          var i = 0;
          $.each(data, function(key, value){
            if($rootScope.language == value['exam_type']){
              var per = parseInt(parseInt(value['correct'])/ parseInt(value['questions']) *100);
              $scope.result[i] = value; 
              $scope.result[i++]['per'] = per;
            }
          });
        });
    });
});

licExamGuru.controller("DetailsController", function($scope, $rootScope, $cookies, $cookieStore, $http, licExamGuruApi, $routeParams, $indexedDB)
{
   $scope.result = [];
   $scope.loading = true;
   $scope.examid = $routeParams.examid;
    $scope.examdata = [];
    $indexedDB.openStore('exam_table', function(store){
        var query = store.QueryBulder().$index('id').$eq($scope.examid);
        store.eachWhere(query).then(function(data){
           $scope.examdata = data[0].result;
           $scope.loadModel(data[0].model_id, data[0].exam_type);
        });
    });

    $scope.loadModel = function(modelId , type){
        $indexedDB.openStore('question', function(store){
        var query = store.QueryBulder().$index('module_id').$eq(modelId);
        store.eachWhere(query).then(function(data){         
          for(i = 0; i < data.length ; i++)
          {
              data[i]['checked'] =  $scope.examdata[i][0];
              data[i]['clicked'] =  $scope.examdata[i][1];
              data[i]['ansokay'] =  $scope.examdata[i][2] == 1 ? true : false;
          }
          $scope.modelPaper = data;
          $scope.loading = false;     
         });
       
     });
    }
});

licExamGuru.controller("PasswordController", function($scope, $rootScope, $cookies, $cookieStore, $http, licExamGuruApi, $routeParams, $indexedDB)
{
   $scope.user_data = [];
   $scope.paddword = '';
   $scope.passwordtext = '';
   $scope.loginFailMsg ='';
   $indexedDB.openStore('users', function(store){
        var query = store.QueryBulder().$index('id').$eq($.cookie('userid'));
        store.eachWhere(query).then(function(data){
          $scope.user_data = data;
        })
    });
   $scope.updateProfile = function()
   {
      $indexedDB.openStore('users', function(store){
         store.upsert($scope.user_data[0]);
         window.location =  window.location = getUrl(url)+"home.html";
      });
   }
   $(".fileImg").change(function(){
      if (this.files && this.files[0]) {
          var reader = new FileReader();
          var that = this;
          reader.onload = function (e) {
              $scope.user_data[0].profile_photo = e.target.result;
              angular.element("#nav-accordion").scope().getProfile(e.target.result);
              $(that).parent().parent().find('img').attr('src', e.target.result);
          }

          reader.readAsDataURL(this.files[0]);
      }
    });

   $scope.showModal = function(){
      $("#myModal").modal('show');
   }
   $scope.resetPass = function()
   {
      if(!$scope.password)
      {
        $scope.loginFailMsg = 'Please enter password';
      }
      else if($scope.password == $scope.passwordtext){
        $scope.user_data[0]['password'] = pass_decode($scope.password);
        $scope.user_data[0]['passwordtext'] = pass_decode($scope.passwordtext);
        $indexedDB.openStore('users', function(store){
           store.upsert($scope.user_data[0]);
           $("#myModal").modal('hide');
        });
      }
      else{
        $scope.loginFailMsg = 'Password does not math';
      }
   }
});






