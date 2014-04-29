var openButton, stopButton;
var editor;
var menu;
var fileEntry;

var gui = require("nw.gui");
var fs = require("fs");
var clipboard = gui.Clipboard.get();

function playFile(theFileEntry) {
  fs.readFile(theFileEntry, function (err, data) {
    if (err) {
      console.log("Read failed: " + err);
    }

    editor.setValue(String(data));
  });
}

var onChosenFileToOpen = function(theFileEntry) {
  playFile(theFileEntry);
};

var onChosenFileToOpen = function() {
//  stopPlayer(theFileEntry);
};


function handleOpenButton() {
  $("#openFile").trigger("click");
}

function handleStopButton() {
  $("#stopFile").trigger("click");
}

function initContextMenu() {
  menu = new gui.Menu();
}


onload = function() {
  initContextMenu();

  openButton = document.getElementById("open");
  stopButton = document.getElementById("stop");

  openButton.addEventListener("click", handleOpenButton);
  stopButton.addEventListener("click", handleStopButton);
 
  $("#saveFile").change(function(evt) {
    onChosenFileToStop($(this).val());
  });
  $("#openFile").change(function(evt) {
    onChosenFileToOpen($(this).val());
  });

  gui.Window.get().show();
};
