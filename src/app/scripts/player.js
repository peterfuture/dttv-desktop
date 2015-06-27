"use strict";

global.g_dtp = process.cwd() + '/node_modules/dtplayer/';

var ref = require('ref');
var ffi = require('ffi');
var Struct = require('ref-struct');
var fs = require('fs');
var dtplayer = require('dtplayer');


//===============================================
// UI Part
//===============================================

var openButton, stopButton;
var pauseButton, ffButton, fbButton;
var editor;
var menu;
var fileEntry;

var gui = require("nw.gui");
var win = gui.Window.get();

win.on('focus', function () {
  console.log(play_url);
  start_play(play_url);
});

var canvas = document.getElementById("video-render");
var context = canvas.getContext("2d");

var canvas_vo = {
    id:1000,
    name:'canvas render',
    vo_init:function(p){
        console.log('yeah, canvas init ok');
    },
    vo_stop:function(p){
		    console.log('yeah, canvas stop ok');
    },
    vo_render:function(p, pic){
        var x_start = 0;
        var y_start = 0;
        var width = canvas.width;
        var height = canvas.height;
        var rgb_lengh = width*height*3;
        var picture = pic.deref();
        var imgdata = context.getImageData(x_start,y_start,width,height);
        var data = picture.data0;

        var rgb_data = data.reinterpret(rgb_lengh);
        var i,j;
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
var start_play = function(url) {

	console.log('start to play '+ url);
  var no_audio = -1;
  var no_video = -1
  var width = canvas.width;
  var height = canvas.height;

  var para = new dtp_para();
  para.file_name = url;
  para.no_audio = no_audio;
  para.no_video = no_video;
  para.video_pixel_format = 2;
  para.width = width;
  para.height = height;
  para.update_cb = dtp_cb;

	console.log('player para : width '+ width +' height '+height);
  ply = new dtplayer();
  ply.reg_vo(canvas_vo);

  //ply.init(para);
  //ply.start();
};


//===============================================
// DTPLAYER Part
//===============================================

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
    start_time:int64_t,
    discontinue_point_ms:int64_t
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
    disable_audio:'int',
    disable_video:'int',
    disable_sub:'int',
    disable_avsync:'int',
    disable_hw_acodec:'int',
    disable_hw_vcodec:'int',
    disable_hw_scodec:'int',
    video_pixel_format:'int',

    width:'int',
    height:'int',
    cookie:voidptr,
    update_cb:voidptr
}
);
var dtp_para_ptr = ref.refType(dtp_para);

var player_status = {
    PLAYER_STATUS_INVALID:       -1,
    PLAYER_STATUS_IDLE:           0,

    PLAYER_STATUS_INIT_ENTER:     1,
    PLAYER_STATUS_INIT_EXIT:      2,

    PLAYER_STATUS_PREPARE_START:  3,
    PLAYER_STATUS_PREPARED:       4,

    PLAYER_STATUS_START:          5,
    PLAYER_STATUS_RUNNING:        6,

    PLAYER_STATUS_PAUSED:         7,
    PLAYER_STATUS_RESUME:         8,
    PLAYER_STATUS_SEEK_ENTER:     9,
    PLAYER_STATUS_SEEK_EXIT:      10,

    PLAYER_STATUS_ERROR:          11,
    PLAYER_STATUS_STOP:           12,
    PLAYER_STATUS_PLAYEND:        13,
    PLAYER_STATUS_EXIT:           14
};

var dtp_cb = ffi.Callback('int',[voidptr,dtp_state_ptr],function(cookie, state)
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
             return 0;
    };

    console.log('cur time(s):' + info.cur_time + '  status:' + sta + '  full time:' + info.full_time);

    if(info.cur_status == player_status.PLAYER_STATUS_EXIT && ply)
        ply.emit('play_end');
    return 0;
});
