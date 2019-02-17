var app = angular.module('myApp', []);

app.controller('globalCtrl', function($scope, $http) {
	$scope.page = 'selectTemplate';
	$scope.advancedOption = false;
	$scope.canvasCover = true;
	$scope.tmplFocused = 0;
	$scope.LOGIN_URL = '/login/google-oauth2/';
	$scope.login = function() {
		location.href = $scope.LOGIN_URL;
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
	$scope.getCookie = function(name) {
		var cookieValue = null;
		if (document.cookie && document.cookie !== '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) === (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
	$scope.saveSession = function (e, callback) {
		var token = $scope.getCookie('csrftoken');
		var jdata, tmpl_data, box_num;

		if (!token) {
			console.log("no token data");
			return;
		}

		jdata = canvas.toJSON();
		tmpl_data = JSON.stringify(jdata);

		// Save session data
		$.post({
			url:'session/',
			data: {
				page: $scope.page,
				data: tmpl_data,
				csrfmiddlewaretoken: token,
			},
			success: function() {
				if (callback) {callback()}
			},
		});
	}
	$scope.addMyTemplate = function() {
		if ($scope.isLogin()) {
			// Upload template
			var jdata = canvas.toJSON();

			// Delete bg for data reduce
			jdata["backgroundImage"] = undefined;

			// Fill form, submit
			save_session(null, function() {
				$('#input-data').attr('value', JSON.stringify(jdata));
				$('#input-thumbnail').attr('value', canvas.toDataURL({multiplier:0.25}));
				$('#upload-tmpl-form').submit();
				dataLayer.push({'event': 'custom: 완료-템플릿생성', 'eventLabel': ''});
			});
		} else {
			alert("로그인이 필요합니다");
			$scope.saveSession(null, function() {
				location.href = $scope.LOGIN_URL;
			});
		}
	}
	$scope.updateUser = function() {
		$http.get("user/").then(function(response) {
			$scope.user = response.data;
		});
	}
	$scope.isLogin = function() {
		$scope.updateUser();
		if ($scope.user.login === undefined) {
			alert("user.login is undefined");
			return false;
		} else if ($scope.user.login === true) {
			return true;
		} else if ($scope.user.login === false) {
			return false;
		}
		alert("user.login is neither true or false");
		return false;
	}
	$scope.downloadCanvas = function($event) {
		var imgId = "imgForDownload";
		var _this = $event.currentTarget;
		if ($scope.isLogin()) {
			// Download Image
			var link = document.createElement('a');
			var img;

			// Download Directly
			link.href = canvas.toDataURL();
			link.download = "mypainting.png";
			link.click();

			// IOS Chrome, Desktop Safari don't support direct download
			// So, show image, then user do download
			if ($(_this).siblings('#'+imgId).length === 0) {
				img = document.createElement('img');
				$(img).attr('id', imgId);
				$(_this).after(img);
			}
			$('#'+imgId).attr('src', canvas.toDataURL());
			dataLayer.push({'event': 'custom: 완료-저장', 'eventLabel': ''});
		} else {
			alert("로그인이 필요합니다");
			save_session(null, function() {
				location.href = LOGIN_URL;
			});
		}
	};

	$scope.updateUser();
	$.get("session/", function(response) {
		var json = response;
		console.log(response);
		window.resres = response
		if (json === {}) {
			//History.add();
		} else {
			$scope.page = json['page'];
			$scope.canvasCover = false;
			// Todo: clean up session data format
			restore_template(json['data']);
			console.log("restore session");
		}
	});
	$http.get("templates/").then(function(response) {
		$scope.hotTemplates = response.data['hot_templates'];
		$scope.userTemplates = response.data['user_templates'];
	});
});
