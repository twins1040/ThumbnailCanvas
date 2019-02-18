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
		return $http.get("user/").then(function(response) {
			$scope.gval.user = response.data;
		});
	}
	$scope.isLogin = function() {
		return new Promise(function(resolve, reject) {
			$scope.getUser().then(function() {
				var _login = $scope.gval.user.login;
				if (_login === true) resolve(true);
				if (_login === false) resolve(false);
				throw new Error("user.login is neither true or false");
			});
		});
	}
	$scope.getHotTmpls = function() {
		return $http.get("templates/hot/").then(function(response) {
			$scope.gval.hotTemplates = response.data;
		});
	}
	$scope.getUserTmpls = function() {
		return $scope.isLogin().then(function() {
			return $http.get("user/templates/").then(function(response) {
				$scope.gval.userTemplates = response.data;
			});
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
	$scope.saveSession = function() {
		return new Promise(function(resolve, reject) {
			var token = $scope.getCookie('csrftoken');
			var jdata;

			if (!token) throw new Error("no token data");

			jdata = canvas.toJSON();

			// Save session data
			$http.post('session/', {
				page: $scope.gval.page,
				data: JSON.stringify(jdata),
				csrfmiddlewaretoken: token,
			}).then(resolve);
		});
	});
	$scope.login = function() {
		return $scope.saveSession().then(function() {
			location.href = $scope.gval.LOGIN_URL;
		});
	}
	// Template
	$scope.focusTemplate =  function(id) {
		$scope.gval.tmplFocused = id;
	}
	$scope.loadTemplate =  function(id) {
		return $http.get('templates/'+id+'/data/').then(function() {
			restore_template(response);
			$scope.gval.canvasCover = false;
		});
	}
	$scope.addMyTemplate = function() {
		return $scope.isLogin().then(function(boolean) {
			if (boolean) {
				var token = $scope.getCookie('csrftoken');
				var jdata;

				if (!token) throw new Error("no token data");

				jdata = canvas.toJSON();
				jdata["backgroundImage"] = undefined;

				// Save session and upload template
				return $scope.saveSession().then(function() {
					$http.post({'user/templates/', {
						data: JSON.stringify(jdata),
						thumbnail: canvas.toDataURL({multiplier:0.25}),
						csrfmiddlewaretoken: token,
					}).then(function() {
						$scope.getUserTmpls(); //Update user tmpls
						$scope.getHotTmpls(); //Update user tmpls
						alert("템플릿이 저장되었습니다. 이전으로 돌아가 템플릿을 확인 해 보세요");
						dataLayer.push({'event': 'custom: 완료-템플릿생성', 'eventLabel': ''});
					});
				});
			} else {
				alert("로그인이 필요합니다");
				return $scope.saveSession().then(function() {
					location.href = $scope.gval.LOGIN_URL;
				});
			}
		});
	}
	// Canvas
	$scope.downloadCanvas = function($event) {
		return $scope.isLogin().then(function(boolean) {
			if (boolean) {
				var imgId = "imgForDownload";
				var _this = $event.currentTarget;
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
				$scope.saveSession().then(function() {
					location.href = LOGIN_URL;
				});
			}
		});
	};
	$scope.loadBackground = function() {
	}
	// Etc
	$scope.jump = function() { $scope.gval.page = 'editTemplate' };

	// Inital setting
	$scope.getUser();
	$http.get("session/").then(function(response) {
		var json = response.data;
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
	$scope.isLogin().then(function() {$scope.getUserTmpls()});
});
