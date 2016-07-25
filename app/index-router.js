function router($routeProvider) {
	$routeProvider	
	.when('/', {
		templateUrl: 'views/loding.html'
	}).when('/signin', {
		templateUrl: 'views/signin.html'
	}).when('/signup', {
		templateUrl: 'views/signup.html'
	}).when('/logout', {
		templateUrl: 'views/logout.html'
	}).when('/licence', {
		templateUrl: 'views/licence.html'
	});
}	

angular
	.module('licExamGuru')
	.config(router);