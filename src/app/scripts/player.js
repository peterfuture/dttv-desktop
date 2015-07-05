"use strict";

global.g_dtp = process.cwd() + '/node_modules/dtplayer/';
var g_player;

// Nodejs 3rd module

var ref = require('ref');
var ffi = require('ffi');
var Struct = require('ref-struct');
var dtplayer = require('dtplayer');

// definition-structure
var int64_t = ref.types.int64;
var dt_char = ref.types.char;
var voidptr = ref.refType(ref.types.void);
var uint8_ptr = ref.refType(ref.types.uint8);

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

var dtp_state_ptr = ref.refType(dtp_state);
var dtp_para_ptr = ref.refType(dtp_para);



//===============================================
// DTPLAYER Part
//===============================================

var dtp_cb = ffi.Callback('int',[voidptr,dtp_state_ptr],function(cookie, state)
{
	var info = state.deref();

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
    $('#cur_time').text(info.cur_time);
    $('#full_time').text(info.full_time);
    var step = info.cur_time * 100 / info.full_time;
    var str_step = step + "%";
    $("#progress").css("width", str_step);

    if(info.cur_status == player_status.PLAYER_STATUS_EXIT && g_player)
        g_player.emit('play_end');
    return 0;
});

//===============================================
// UI Part
//===============================================

var gui = require("nw.gui");
var win = gui.Window.get();
var canvas = document.getElementById("video-render");
var context = canvas.getContext("2d");
var btn_pause = document.getElementById("btn_pause");
var btn_close = document.getElementById("btn_close");
var progress = document.getElementById("progress");
var label_cur_time = document.getElementById("cur_time");
var label_full_time = document.getElementById("full_time");

var player_started = 0;

var canvas_vo = {
    id:1000,
    name:'H5 Canvas Render',
    vo_init:function(p){
        console.log('H5 Canvas init ok');
    },
    vo_stop:function(p){
		    console.log('H5 Canvas stop ok');
    },
    vo_render:function(p, pic){
        var x_start = 0;
        var y_start = 0;
        var width = canvas.width;
        var height = canvas.height;
        var rgb_lengh = width*height*4;
        var picture = pic.deref();
        //var imgdata = context.getImageData(x_start,y_start,width,height);
        var data = picture.data0;

        var pre = new Date().getTime();

        var rgb_data = data.reinterpret(rgb_lengh);
        //var imgdata = new ImageData(rgb_data, canvas.width, canvas.height);
        var imgdata = context.createImageData(canvas.width, canvas.height);
        imgdata.data.set(rgb_data);
        /*
        var i,j;
        for(i=0,j=0;i<rgb_lengh;i+=4,j+=4)
        {

            imgdata.data[j] = rgb_data[i];
            imgdata.data[j+1] = rgb_data[i+1];
            imgdata.data[j+2] = rgb_data[i+2];
            imgdata.data[j+3] = rgb_data[i+3];

        }
        */
        context.putImageData(imgdata,x_start,y_start);
        console.log("last time:" + (new Date().getTime() - pre) + "ms");
        return 0;
    }
};

var start_play = function(url) {

  console.log('start to play '+ url);
  // tips: need init all the elements -- !!!
  var para = new dtp_para();
  para.file_name = url;
  para.audio_index = -1;
  para.video_index = -1;
  para.sub_index = -1;

  para.loop_mode = 0;
  para.disable_audio = 0;
  para.disable_video = 0;
  para.disable_sub = 0;
  para.disable_avsync = 0;

  para.disable_hw_acodec = 0;
  para.disable_hw_vcodec = 0;
  para.disable_hw_scodec = 0;
  para.video_pixel_format = 3;

  para.width = canvas.width;
  para.height = canvas.height;
  para.cookie = null;
  para.update_cb = dtp_cb;

  console.log('player para : width '+ para.width +' height '+ para.height);
  g_player = new dtplayer();
  g_player.reg_vo(canvas_vo);

  g_player.init(para);
  g_player.start();
};

var pause_play = function () {
  g_player.pause();
};

var stop_play = function () {
  g_player.stop();
  g_player = null;
  player_started = 0;
};

win.on('focus', function () {
  console.log(play_url);
  if(player_started === 1)
    return;
  start_play(play_url);
  player_started = 1;
});
