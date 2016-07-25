function router($routeProvider) {
	$routeProvider	
	.when('/', {
		templateUrl: 'views/dashboard.html'
	}).when('/metarial/:name', {
		templateUrl: 'views/metarial.html'
	}).when('/report', {
		templateUrl: 'views/exam-report.html'
	}).when('/setting', {
		templateUrl: 'views/setting.html'
	}).when('/report/details/:examid', {
		templateUrl: 'views/exam-details.html'
	}).when('/analytisreport/:type', {
		templateUrl: 'views/analytics-report.html'
	}).when('/:model/:module_id', {
		templateUrl: 'views/model-paper.html'
	})
	.when('/:exam/:model/:module_id', {
		templateUrl: 'views/exam-paper.html'
	});

}	

angular
	.module('licExamGuru')
	.config(router);