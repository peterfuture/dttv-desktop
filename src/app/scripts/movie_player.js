"use strict";

var movie_player = angular.module('dttv.movie_player', []);

movie_player.config(function($routeProvider){
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
