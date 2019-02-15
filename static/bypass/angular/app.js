var app = angular.module('myApp', []);

app.controller('globalCtrl', function($scope, $http) {
	$scope.page = 'selectTemplate';
	$scope.advancedOption = false;
	$scope.canvasCover = true;
	$scope.tmplFocused = 0;
	$scope.login = function() {
		location.href = "login/google-oauth2/";
	}
	$scope.loadTemplate =  function(id) {
		$.ajax({
			url:'templates/'+id+'/data/',
			success: function(response) {
				restore_template(response);
			},
		});
		$scope.canvasCover = false;
	}
	$scope.focusTemplate =  function(id) {
		$scope.tmplFocused = id;
		console.log(id);
	}
	$scope.jump = function() { $scope.page='editTemplate' };
	$http.get("templates/").then(function(response) {
		$scope.hotTemplates = response.data['hot_templates'];
		$scope.userTemplates = response.data['user_templates'];
	});
	$http.get("user/").then(function(response) {
		$scope.user = response.data;
	});
});
