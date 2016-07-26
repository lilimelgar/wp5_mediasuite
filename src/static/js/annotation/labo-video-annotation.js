var _player = clariah.VimeoPlayer;
var AnnotationBox = clariah.AnnotationBox;
var SegmentationControls = clariah.SegmentationControls;
_player.init({
    loadProgress : function (data) {
        console.debug('loadProgress event : ' +
            data.percent + ' : ' +
            data.bytesLoaded + ' : ' +
            data.bytesTotal + ' : ' +
            data.duration
        );
    },

    playProgress : function(data) {
        //console.debug('playProgress event : ' + data.seconds + ' : ' + data.percent + ' : ' + data.duration);
        getPosition();
    },

    play : function(data) {
        console.debug('play event');
        getDuration();
        //_player.isPaused(onIsPaused)
        _isPaused = false;
    },

    pause : function(paused) {
        console.debug('pause event');
        _isPaused = paused;
    },

    finish : function(data) {
        console.debug('finish');
    },

    seek : function(data) {
        console.debug('seek event : ' + data.seconds + ' : ' + data.percent + ' : ' + data.duration);
    }

});

//render the stuff on screen
ReactDOM.render(<AnnotationBox player={_player}/>, document.getElementById('annotation_box'));
ReactDOM.render(<SegmentationControls/>, document.getElementById('segmentation_controls'));

//expose the player to the subsequently loaded javascript (TODO this is temporary)
window._player = _player;