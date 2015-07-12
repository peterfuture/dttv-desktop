"use strict";

var movie_browser = angular.module('dttv.movie_browser', []);

movie_browser.config(function($routeProvider){
	$routeProvider
			.when('/movie_browser', {
      	templateUrl : 'views/movie_browser/movie_browser.html',
      })
});

var controller_movie_browser = movie_browser.controller('controller_movie_browser', ['$scope', '$routeParams',function ($scope, $routeParams) {

	// load & display movies

	$scope.play = function()
	{
		location.href="#movie_player/";
	};


}]);
