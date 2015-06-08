"use strict";

var dttv = angular.module('dttv',
	['ui.bootstrap','ngRoute',
	'dttv.file_browser']);

dttv.config(function($routeProvider){
	$routeProvider.otherwise({ redirectTo: '/file_browser' });
});
