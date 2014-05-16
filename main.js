//===============================================
// DTPLAYER Part
//===============================================

var ref = require('ref');
var ffi = require('ffi');
var Struct = require('ref-struct');
var fs = require('fs');
var dtplayer = require('dtplayer');

// type def
var int64_t = ref.types.int64;
var dt_char = ref.types.char;
var voidptr = ref.refType(ref.types.void);
var uint8_ptr = ref.refType(ref.types.uint8);
// structure def
var dtp_state = Struct(
{
    cur_status:'int',
    last_status:'int',
    cur_time_ms:int64_t,
    cur_time:int64_t,
    full_time:int64_t,
    start_time:int64_t
}
);
var dtp_state_ptr = ref.refType(dtp_state);

var dtp_para = Struct(
{
    file_name:'string',
    video_index:'int',
    audio_index:'int',
    sub_index:'int',
    loop_mode:'int',
    no_audio:'int',
    no_video:'int',
    no_sub:'int',
    sync_enable:'int',
    width:'int',
    height:'int',
    update_cb:voidptr
}
);
var dtp_para_ptr = ref.refType(dtp_para);

var player_status = {
    PLAYER_STATUS_INVALID:   -1,
    PLAYER_STATUS_IDLE:       0,
    
    PLAYER_STATUS_INIT_ENTER: 1,
    PLAYER_STATUS_INIT_EXIT:  2,

    PLAYER_STATUS_START:      3,
    PLAYER_STATUS_RUNNING:    4,

    PLAYER_STATUS_PAUSED:     5,
    PLAYER_STATUS_RESUME:     6,
    PLAYER_STATUS_SEEK_ENTER: 7,
    PLAYER_STATUS_SEEK_EXIT:  8,

    PLAYER_STATUS_ERROR:      9,
    PLAYER_STATUS_STOP:      10,
    PLAYER_STATUS_PLAYEND:   11,
    PLAYER_STATUS_EXIT:      12
};

var canvas = document.getElementById("video-render");
var context = canvas.getContext("2d");

var canvas_vo = {
    id:1000,
    name:'canvas render',
    vo_init:function(){
        console.log('yeah, canvas init ok');
    },
    vo_stop:function(){
        console.log('yeah, canvas stop ok');
    },
    vo_render:function(pic){

        var picture = pic.deref();
        var imgdata = context.getImageData(0,0,720,480);
        var data = picture.data0.deref();
        for(i=0,j=0;i<720*480*3;i+=3,j+=4)
        {
            imgdata.data[j] = data+i;
            imgdata.data[j+1] = data+i+1;
            imgdata.data[j+2] = data+i+2;
            imgdata.data[j+3] = 255;
        }

        ctx.putImageData(imgdata,0,0);
        console.log('canvas render one frame, pts'+ picture.pts + "width *4 = "+picture.linesize0);
        return 0;
    }
};

var ply;
var dtp_cb = ffi.Callback('void',[dtp_state_ptr],function(state)
{
	var info = state.deref();
    //ply.emit('update_info');

    var sta;
    switch(info.cur_status){
        case player_status.PLAYER_STATUS_EXIT:
             sta = '-exit-';
             break;
        case player_status.PLAYER_STATUS_RUNNING:
             sta = '-playing-';
             break;
        case player_status.PLAYER_EVENT_PAUSE:
             sta = '-pause-';
             break;
        case player_status.PLAYER_STATUS_SEEK_ENTER:
             sta = '-seeking-';
             break
        default:
             return '-unkown-';
    };

    console.log('cur time(s):' + info.cur_time + '  status:' + sta + '  full time:' + info.full_time);

    if(info.cur_status == player_status.PLAYER_STATUS_EXIT)
        ply.emit('play_end');
});

//===============================================
// UI Part
//===============================================

var openButton, stopButton;
var editor;
var menu;
var fileEntry;

var gui = require("nw.gui");
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
  //$("#openFile").trigger("click");

    console.log('here we want to play a video');
    var url = '../1.mp4';
    var no_audio = -1;
    var no_video = -1
    var width = 720;
    var height = 480;

    var para = new dtp_para();
    para.file_name = url;
    para.no_audio = no_audio;
    para.no_video = no_video;
    para.width = width;
    para.height = height;
    para.update_cb = dtp_cb;

    ply = new dtplayer();
    ply.reg_vo(canvas_vo);

    ply.init(para);
    ply.start();
    
}

function handleStopButton() {
  $("#stopFile").trigger("click");
  ply.stop();
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
