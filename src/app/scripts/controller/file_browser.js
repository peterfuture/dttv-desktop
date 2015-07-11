"use strict";

global.$ = $;
var abar = require(process.cwd()+'/src/app/scripts/address_bar.js');
var folder_view = require(process.cwd()+'/src/app/scripts/folder_view.js');
var nwGui = require('nw.gui');

var file_browser = angular.module('dttv.file_browser', []);

file_browser.config(function($routeProvider){
	$routeProvider
		.when('/file_browser', {
    	templateUrl : 'views/file_browser.html',
    })
});

var file_browser_controller = file_browser.controller('file_browser_controller', ['$scope', '$routeParams',function ($scope, $routeParams) {
		//--------------------------------
		$scope.cur ={};
		$scope.url = 'file path';

		// get file list and bind to html element
		bind_local_files();
		//--------------------------------

}]);

var file_browser_app = {
	play: function (path) {
		var uri = path;
		/*
		var params = {toolbar: false, resizable: false, show: true, width: 800,height: 600};
		var playWindow = nwGui.Window.open('play.html', params);
		playWindow.on('document-end', function() {
			playWindow.window.play_url = path;
			playWindow.focus();
		});*/

		// switch to movie player home
		location.href="#movie_player";

		/*
		location.href="play.html";

		var video_path=document.getElementById("video_path");
		video_path.text("Hello");
		$('p').text('world');

		wGui.Window.get().onload() = function () {
			$('p').text('world');
		};*/

	},
	// change folder for sidebar links
	cd: function (anchor) {
		anchor = $(anchor);

		$('#sidebar li').removeClass('active');
		$('#sidebar i').removeClass('icon-white');

		anchor.closest('li').addClass('active');
		anchor.find('i').addClass('icon-white');

		this.setPath(anchor.attr('nw-path'));
	},

	// set path for file explorer
	setPath: function (path) {
		if (path.indexOf('~') == 0) {
			path = path.replace('~', process.env['HOME']);
		}
		this.folder.open(path);
		this.addressbar.set(path);
	}
};

var bind_local_files = function() {

	var folder = new folder_view.Folder($('#files'));
	var addressbar = new abar.AddressBar($('#addressbar'));

	folder.open(process.cwd());
	addressbar.set(process.cwd());

	file_browser_app.folder = folder;
	file_browser_app.addressbar = addressbar;

	folder.on('navigate', function(dir, mime) {
		if (mime.type == 'folder') {
			addressbar.enter(mime);
		} else {
			//Here to locate playing html
			//nwGui.Shell.openItem(mime.path);
			file_browser_app.play(mime.path)
		}
	});

	addressbar.on('navigate', function(dir) {
		folder.open(dir);
	});

	// sidebar favorites
	// set filter
	$('[nw-path]').bind('click', function (event) {
		event.preventDefault();
		//file_browser_app.cd(this);
	});
}
