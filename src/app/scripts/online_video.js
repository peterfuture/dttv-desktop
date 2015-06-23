"use strict";

var online_video = angular.module('dttv.online_video', []);

online_video.config(function($routeProvider){
	$routeProvider
			.when('/online_video', {
                templateUrl : 'views/online_video.html',
            })
});

var online_video_controller = file_browser.controller('online_video_controller', ['$scope', '$routeParams',function ($scope, $routeParams) {
		//--------------------------------
		$scope.cur ={};
		$scope.open = function(path){
			alert("try to play" + path);
		}

		//--------------------------------
}]);
