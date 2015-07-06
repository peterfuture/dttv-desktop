"use strict";

var online_video = angular.module('dttv.movie_player', []);

online_video.config(function($routeProvider){
	$routeProvider
  .when('/movie_player', {
        templateUrl : 'views/movie_player.html',
  })
});

var movie_player_controller = file_browser.controller('movie_player_controller', ['$scope', '$routeParams',function ($scope, $routeParams) {
		//--------------------------------
		$scope.cur ={};
		$scope.open = function(path){
			alert("try to play" + path);
		}

    alert("try to play");
		//--------------------------------
}]);
