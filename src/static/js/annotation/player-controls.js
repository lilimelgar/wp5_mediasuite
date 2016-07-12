var videoUrl = '';
var _player = null;//this can be a jw or vimeo player

var _duration = 0;
var _curPosition = 0;
var _isPaused = true;

var _start = -1;
var _end = -1;
var _screenScale = 0;
var _videos = [];

var _fragmentMode = false;

var _curVideoIndex = 0;//FIXME this needs to be removed there should only be one video!
var _currentAnchorIndex = -1;

var _currentClip = null;


$(document).ready( function() {
    //Get the canvas &
    var c = $('#timebar_canvas');
    var ct = c.get(0).getContext('2d');
    var container = $(c).parent();

    //Run function when browser resizes
    $(window).resize( respondCanvas );

    function respondCanvas(){
        c.attr('width', $(container).width() ); //max width
        c.attr('height', $(container).height() ); //max height
    }
    respondCanvas();

    //make sure to disable the standard button keyevents, so the space bar won't accidentally trigger a button press
    $('button').keydown(function(event) {
		event.preventDefault();
    });
    $('button').keyup(function(event) {
		event.preventDefault();
    });
    $('button').keypress(function(event) {
		event.preventDefault();
    });
    init();

});


function init() {
    initTimebar();
    initKeyBindings();
}


/***********************************************************************************
 * player event callback functions
 **********************************************************************************/
function onLoadProgress(data) {
    //console.debug('loadProgress event : ' + data.percent + ' : ' + data.bytesLoaded + ' : ' + data.bytesTotal + ' : ' + data.duration);
}

function onPlayProgress(data) {
    //console.debug('playProgress event : ' + data.seconds + ' : ' + data.percent + ' : ' + data.duration);
    getPosition();
}

function onPlay(data) {
    console.debug('play event');
    getDuration();
    //_player.isPaused(onIsPaused)
    _isPaused = false;
}

function onIsPaused(paused) {
    _isPaused = paused;
}

function onPause(data) {
    console.debug('pause event');
    _isPaused = true;
}

function onFinish(data) {
    console.debug('finish');
}

function onSeek(data) {
    console.debug('seek event : ' + data.seconds + ' : ' + data.percent + ' : ' + data.duration);
}


// function onPlayerTime(e) {
//     getPosition();
// }

// function onResizePlayer(e) {

// }

// function onPlayerReady(e) {
//    getDuration();
// }

/***********************************************************************************
 * basic player controls
 **********************************************************************************/

function play() {
    _player.play();
}

function pause() {
    _player.pause();
}

function seek(secs) {
    _player.seek(secs);
}

function getDuration() {
     _player.getDuration(onGetDuration);
}

function onGetDuration(value) {
    _duration = value;
    updateBar();
}

function getPosition() {
    _player.getPosition(onGetPosition);
}

function onGetPosition(value) {
    console.debug('Pos = ' + value);
    _curPosition = value;
    if(_fragmentMode) { //make sure the fragment player cannot pass beyond the end time
        var end = _videos[_curVideoIndex].end / 1000;
        if(_curPosition >= end) {
            seek(end);
            pause();
        }
    }
    updateBar();
}

/***********************************************************************************
 * annotation player controls
 **********************************************************************************/

function setStart(start) {
    var temp = -1;
    if(start == undefined) {
        temp = _curPosition;
    } else {
        temp = start;
    }
    if((_end != -1 && temp < _end) || _end == -1) {
        _start = temp;
        if(!_fragmentMode) {
            $('#video_start').text(formatTime(_start));
        }
        $('#start_time').val(formatTime(_start));
        updateBar();
    } else {
        alert('The start must be smaller than the end time');
    }
}

function setEnd(end, skipPause) {
    var temp = -1;
    if(end == undefined) {
        temp = _curPosition;
    } else {
        temp = end;
    }
    if((_start != -1 && temp > _start) || _start == -1) {
        _end = temp;
        if(!_fragmentMode) {
            $('#video_end').text(formatTime(_end));
        }
        $('#end_time').val(formatTime(_end));
        updateBar();
        if(skipPause == undefined) {
            pause(true);
        }
    } else {
        alert('The end time must be bigger than the start time');
    }
}



function playStart() {
    seek(_start);
}

function playEnd() {
    seek(_end);
}

function rw(t) {
    if(_fragmentMode) {
        var start = _videos[_curVideoIndex].start / 1000;
        if(_curPosition -t < start) {
            seek(start);
        } else {
            seek(_curPosition - t);
        }
    } else {
        seek(_curPosition - t);
    }
}

function ff(t) {
    if(_fragmentMode) {
        var end = _videos[_curVideoIndex].end / 1000;
        if(_curPosition + t > end)  {
            seek(end);
        } else {
            seek(_curPosition + t);
        }
    } else {
        seek(_curPosition + t);
    }
}

// function scaleScreen(enlarge) {
//     if(enlarge) {
//         jw.resize(50, 50);
//     } else {
//         jw.resize(-50, -50);
//     }
// }

function setManualStart() {
    var s = $('#start_time').val();
    console.debug(s);
    _start = moment.duration(s).asSeconds();
    updateBar();
    seek(_start);
}

function setManualEnd() {
    var s = $('#end_time').val();
    console.debug(s);
    _end = moment.duration(s).asSeconds();
    updateBar();
    seek(_end);
}

//TODO this function needs to be adapted (make sure to hide the player controls)
function toggleSegmentMode() {
    if(validateDuration(_start, _end)) {
        _fragmentMode = true;

        setStart(_videos[_curVideoIndex].start / 1000);
        setEnd(_videos[_curVideoIndex].end / 1000);

        _videos[_curVideoIndex].start = _start * 1000;//ms!
        _videos[_curVideoIndex].end = _end * 1000;//ms!

        //updateAnchors();
        updateBar();
    } else {
        alert('A clip must be at least 15 seconds long');
    }
}


/***********************************************************************************
 * player timebar (controls)
 **********************************************************************************/

function initTimebar(fragmentMode) {
    //first unbind any existing events from the canvas
    $('#timebar_canvas').unbind( "click" );

    //then bind a new one depending on the edit mode (fragmentMode)
    if(_fragmentMode) {
        $('#timebar_canvas').click(function(e) {
            var c = document.getElementById("timebar_canvas");
            var mousePos = getMousePos(c, e);
            var start = _videos[_curVideoIndex].start / 1000;
            var end = _videos[_curVideoIndex].end / 1000;
            var dur = end - start;
            var pos = dur / 100 * (mousePos.x / (c.width / 100));
            seek(start + pos);
        });
    } else {
        $('#timebar_canvas').click(function(e) {
            var c = document.getElementById("timebar_canvas");
            var mousePos = getMousePos(c, e);
            var dur = _duration;
            var pos = dur / 100 * (mousePos.x / (c.width / 100));
            seek(pos);
        });
    }
}

function updateBar() {
    var c = document.getElementById("timebar_canvas");
    var dur = -1;

    if(_fragmentMode) {
        var start = _videos[_curVideoIndex].start / 1000;
        var end = _videos[_curVideoIndex].end / 1000;
        var dur = end - start;
        var t = _curPosition;
        if(!t) {
            t = _start;
        }
        var dt = t - start;
        var formattedTime = formatTime(t);
        var elapsed = c.width / 100 * (dt / (dur / 100));
        var startPoint = c.width / 100 * ((_start - start) / (dur / 100));
        var endPoint = c.width / 100 * ((_end - start) / (dur / 100));
        var ctx = c.getContext("2d");
        ctx.clearRect (0, 0, c.width, c.height);
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0,0, elapsed, c.height / 3);//time progressing
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(startPoint, 0, 3, c.height);//time progressing
        ctx.fillStyle = "#FFFF00";
        ctx.fillRect(endPoint, 0, 3, c.height);//time progressing
        ctx.font = "20px Verdana";
        ctx.fillStyle = "#FFFF00";
        ctx.fillText(formattedTime, 10, c.height - 5);


    } else {
        var dur = _duration;
        var t =_curPosition;
        if(!t) {
            t = _start;
        }
        var formattedTime = formatTime(t);
        var elapsed = c.width / 100 * (t / (dur / 100));
        var startPoint = c.width / 100 * (_start / (dur / 100));
        var endPoint = c.width / 100 * (_end / (dur / 100));
        var ctx = c.getContext("2d");
        ctx.clearRect (0, 0, c.width, c.height);
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0,0, elapsed, c.height / 3);//time progressing
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(startPoint, 0, 3, c.height);//time progressing
        ctx.fillStyle = "#FFFF00";
        ctx.fillRect(endPoint, 0, 3, c.height);//time progressing
        ctx.font = "20px Verdana";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(formattedTime, 10, c.height - 5);
    }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}


/***********************************************************************************
 * helper functions
 **********************************************************************************/

function formatTime(t) {
    var pt = moment.duration(t * 1000);
    var h = pt.hours() < 10 ? '0' + pt.hours() : pt.hours();
    var m = pt.minutes() < 10 ? '0' + pt.minutes() : pt.minutes();
    var s = pt.seconds() < 10 ? '0' + pt.seconds() : pt.seconds();
    return h + ':' + m + ':' + s;
}

function validateDuration(start, end) {
    if(end == -1 || start == -1) {
        return true;
    }
    if(end - start < 15 && !_fragmentMode) {
        return false;
    } else if(end - start < 1 && _fragmentMode) {
        return false;
    }
    return true;
}

/***********************************************************************************
 * keyboard bindings
 **********************************************************************************/

//this function checks if the user is using any of the input fields. If so the keyboard shortcuts must be disabled
function checkFocus(f, args) {
    if($('input').is(':focus')) {
        return true;
    }
    if(f) {
        f(args);
    }
}

function initKeyBindings() {
    //arrow key shortcuts
    jwerty.key('left', function() {
        checkFocus(rw, 60);
    });
    jwerty.key('right', function() {
        checkFocus(ff, 60);
    });

    //pause & play shortcut
    jwerty.key('space', function() {
        if(!checkFocus()) {
            if(_isPaused) {//FIXME, this does not work yet!
                pause();
            } else {
                play();
            }
        }
    });

    //start & end shortcuts
    jwerty.key('i', function() {
        checkFocus(setStart);
    });
    jwerty.key('o', function() {
        checkFocus(setEnd);
    });
    jwerty.key('shift+i', function() {
        checkFocus(playStart);
    });
    jwerty.key('shift+o', function() {
        checkFocus(playEnd);
    });

    //anchor functions
    jwerty.key(']', function() {
        checkFocus(nextAnchor);
    });
    jwerty.key('[', function() {
        checkFocus(previousAnchor);
    });
    jwerty.key('ctrl+s', function() {
        checkFocus(saveAnchor);
    });
    jwerty.key('ctrl+n', function() {
        checkFocus(newAnchor);
    });

    //fast forward shortcuts (somehow cannot create these in a loop...)
    jwerty.key('1', function() {
        checkFocus(ff, 1);
    });
    jwerty.key('2', function() {
        checkFocus(ff, 2);
    });
    jwerty.key('3', function() {
        checkFocus(ff, 3);
    });
    jwerty.key('4', function() {
        checkFocus(ff, 4);
    });
    jwerty.key('5', function() {
        checkFocus(ff, 5);
    });
    jwerty.key('6', function() {
        checkFocus(ff, 6);
    });
    jwerty.key('7', function() {
        checkFocus(ff, 7);
    });
    jwerty.key('8', function() {
        checkFocus(ff, 8);
    });
    jwerty.key('9', function() {
        checkFocus(ff, 9);
    });

    //rewind shortcuts
    jwerty.key('shift+1', function() {
        checkFocus(rw, 1);
    });
    jwerty.key('shift+2', function() {
        checkFocus(rw, 2);
    });
    jwerty.key('shift+3', function() {
        checkFocus(rw, 3);
    });
    jwerty.key('shift+4', function() {
        checkFocus(rw, 4);
    });
    jwerty.key('shift+5', function() {
        checkFocus(rw, 5);
    });
    jwerty.key('shift+6', function() {
        checkFocus(rw, 6);
    });
    jwerty.key('shift+7', function() {
        checkFocus(rw, 7);
    });
    jwerty.key('shift+8', function() {
        checkFocus(rw, 8);
    });
    jwerty.key('shift+9', function() {
        checkFocus(rw, 9);
    });
}