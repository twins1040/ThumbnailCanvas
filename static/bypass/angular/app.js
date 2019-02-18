var app = angular.module('myApp', []);

app.controller('globalCtrl', function($scope, $http) {
	$scope.gval = {
		user : {
			login : false,
			super : false,
		},
		page : 'selectTemplate',
		tmplTab : 'hot',
		advancedOption : false,
		canvasCover : false,
		tmplFocused : 0,
		LOGIN_URL : '/login/google-oauth2/',
	}
	// Login, Session
	$scope.getUser = function() {
		$http.get("user/").then(function(response) {
			$scope.gval.user = response.data;
		});
	}
	$scope.getHotTmpls = function() {
		$http.get("templates/hot/").then(function(response) {
			$scope.gval.hotTemplates = response.data;
		});
	}
	$scope.getUserTmpls = function() {
		if (!$scope.isLogin()) {
			console.log("unauthorized");
			return;
		}
		$http.get("user/templates/").then(function(response) {
			$scope.gval.userTemplates = response.data;
		});
	}
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
				page: $scope.gval.page,
				data: tmpl_data,
				csrfmiddlewaretoken: token,
			},
			success: function() {
				if (callback) {callback()}
			},
		});
	}
	$scope.login = function() {
		$scope.saveSession(null, function() {
			location.href = $scope.gval.LOGIN_URL;
		});
	}
	$scope.isLogin = function() {
		$scope.getUser();
		if ($scope.gval.user.login === undefined) {
			alert("user.login is undefined");
			return false;
		} else if ($scope.gval.user.login === true) {
			return true;
		} else if ($scope.gval.user.login === false) {
			return false;
		}
		alert("user.login is neither true or false");
		return false;
	}
	// Template
	$scope.focusTemplate =  function(id) {
		$scope.gval.tmplFocused = id;
	}
	$scope.loadTemplate =  function(id) {
		$.ajax({
			url:'templates/'+id+'/data/',
			success: function(response) {
				restore_template(response);
			},
		});
		$scope.gval.canvasCover = false;
	}
	$scope.addMyTemplate = function() {
		if ($scope.isLogin()) {
			var token = $scope.getCookie('csrftoken');
			var jdata = canvas.toJSON();

			if (!token) {
				console.log("no token data");
				return;
			}
			// Remove Background
			jdata["backgroundImage"] = undefined;
			// Save session and upload template
			$scope.saveSession(null, function() {
				$.post({
					url:'user/templates/',
					data: {
						data: JSON.stringify(jdata),
						thumbnail: canvas.toDataURL({multiplier:0.25}),
						csrfmiddlewaretoken: token,
					},
					success: function() {
						$scope.getUserTmpls(); //Update user tmpls
						$scope.getHotTmpls(); //Update user tmpls
						alert("템플릿이 저장되었습니다. 이전으로 돌아가 템플릿을 확인 해 보세요");
						dataLayer.push({'event': 'custom: 완료-템플릿생성', 'eventLabel': ''});
					},
				});
			});
		} else {
			alert("로그인이 필요합니다");
			$scope.saveSession(null, function() {
				location.href = $scope.gval.LOGIN_URL;
			});
		}
	}
	// Canvas
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
	$scope.loadBackground = function() {

	}
	// Etc
	$scope.jump = function() { $scope.gval.page = 'editTemplate' };

	// Inital setting
	$scope.getUser();
	$.get("session/", function(response) {
		var json = response;
		if ($.isEmptyObject(json)) {
			$scope.gval.canvasCover = true;
			//History.add();
		} else {
			$scope.gval.page = json['page'];
			$scope.gval.canvasCover = false;
			// Todo: clean up session data format
			restore_template(json['data']);
			console.log("restore session");
		}
	});
	$scope.getHotTmpls();
	if ($scope.isLogin()) $scope.getUserTmpls();
});
