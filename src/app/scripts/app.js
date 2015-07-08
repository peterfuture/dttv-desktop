"use strict";

var dttv = angular.module('dttv',
	['ui.bootstrap','ngRoute',
	'dttv.file_browser', 'dttv.online_video',
	'dttv.movie_player']);

dttv.config(function($routeProvider){
	$routeProvider.otherwise({ redirectTo: '/file_browser' });
});

var nwGui = require('nw.gui');
var about = function () {
  var params = {toolbar: false, resizable: false, show: true, height: 120, width: 350};
  var aboutWindow = nwGui.Window.open('views/about.html', params);
  aboutWindow.on('document-end', function() {
    aboutWindow.focus();
    // open link in default browser
    $(aboutWindow.window.document).find('a').bind('click', function (e) {
      e.preventDefault();
      nwGui.Shell.openExternal(this.href);
    });
  });
}
