global.g_dtp = process.cwd() + '/node_modules/dtplayer/'

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
        var x_start = 0;
        var y_start = 0;
        var width = canvas.width;
        var height = canvas.height;
        var rgb_lengh = width*height*3;
        var picture = pic.deref();
        var imgdata = context.getImageData(x_start,y_start,width,height);
        var data = picture.data0;
		var rgb_data = data.reinterpret(rgb_lengh);
        for(i=0,j=0;i<rgb_lengh;i+=3,j+=4)
        {
            imgdata.data[j] = rgb_data[i];
            imgdata.data[j+1] = rgb_data[i+1];
            imgdata.data[j+2] = rgb_data[i+2];
            imgdata.data[j+3] = 255;
        }
        context.putImageData(imgdata,x_start,y_start);
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
	{
		canvas.width = canvas.width; // clear canvas
        ply.emit('play_end');
	}
});

//===============================================
// UI Part
//===============================================

var openButton, stopButton;
var pauseButton, ffButton, fbButton;
var editor;
var menu;
var fileEntry;

var gui = require("nw.gui");

var onChosenFileToOpen = function(theFileEntry) {
	
	console.log('start to play '+ theFileEntry);
	var url = theFileEntry;
    var no_audio = -1;
    var no_video = -1
    var width = canvas.width;
    var height = canvas.height;

    var para = new dtp_para();
    para.file_name = url;
    para.no_audio = no_audio;
    para.no_video = no_video;
    para.width = width;
    para.height = height;
    para.update_cb = dtp_cb;

	console.log('player para : width '+ width +' height '+height);
    ply = new dtplayer();
    ply.reg_vo(canvas_vo);

    ply.init(para);
    ply.start();
};

function handleOpenButton() {
  alert("open");
  $("#openFile").trigger("click");
}

function handleStopButton() {
	console.log('stop player');
	if(ply)
		ply.stop();
}

function handlePauseButton() {
	if(ply)
		ply.pause();
}

function handleFFButton() {
	if(ply)
		ply.seek(10);
}

function handleFBButton() {
	if(ply)
		ply.seek(-10);
}

function initContextMenu() {
  menu = new gui.Menu();
}

onload = function() {
  initContextMenu();

  openButton = document.getElementById("open");
  stopButton = document.getElementById("stop");
  pauseButton = document.getElementById("pause");
  ffButton = document.getElementById("ff");
  fbButton = document.getElementById("fb");

  openButton.addEventListener("click", handleOpenButton);
  stopButton.addEventListener("click", handleStopButton);
  pauseButton.addEventListener("click", handlePauseButton);
  ffButton.addEventListener("click", handleFFButton);
  fbButton.addEventListener("click", handleFBButton);
 
  $("#openFile").change(function(evt) {
    onChosenFileToOpen($(this).val());
  });

  gui.Window.get().show();
};
