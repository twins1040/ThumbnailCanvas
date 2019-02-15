var app = angular.module('myApp', []);

app.controller('templateCtrl', function($scope, $http) {
	$scope.page = 'selectTemplate';
	$scope.advancedOption = false;
	$http.get("templates/").then(function(response) {
		$scope.hotTemplates = response.data['hot_templates'];
		$scope.userTemplates = response.data['user_templates'];
	});
});
