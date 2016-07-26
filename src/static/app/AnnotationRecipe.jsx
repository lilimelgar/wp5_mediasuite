import React from 'react';
import VimeoPlayer from './player/VimeoPlayer';
import VideoTimeBar from './components/annotation/VideoTimeBar';
import SegmentationControls from './components/annotation/SegmentationControls';
import TimeUtil from './util/TimeUtil';

class AnnotationRecipe extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			froogaloop : null,//specific API for Vimeo player
			curPosition : 0,
			duration : 0,
			start : -1,
			end : -1
		}
	}

	//TODO make sure to offer support for rendering different players, now it's just Vimeo (ArtTube needs this)
	componentDidMount() {
		console.debug('Mounted the iframe HTML, rendering the player');
		var vimeoPlayers = document.querySelectorAll('iframe');
		var vimeoPlayer = null;
		for (var i = 0, length = vimeoPlayers.length; i < length; i++) {
			vimeoPlayer = vimeoPlayers[i];
			$f(vimeoPlayer).addEvent('ready', this.vimeoPlayerMounted.bind(this));
		}
	}

	vimeoPlayerMounted(playerId) {
		const eventCallbacks = {
			loadProgress : this.loadProgress.bind(this),
		    playProgress : this.playProgress.bind(this),
		    play : this.onPlay.bind(this),
		    pause : this.onPause.bind(this),
		    finish : this.onFinish.bind(this),
		    seek : this.onSeek.bind(this)
		}
		console.debug('Rendered the player, setting up the player API');
		this.setState({
			froogaloop : $f(playerId)
		});
		console.debug(eventCallbacks);
		for(let key in eventCallbacks) {
			console.debug(key);
			this.state.froogaloop.addEvent(key, eventCallbacks[key]);
		}
	}

	/*************************************** Vimeo player callbacks ***************************************/

	//these functions are mandatory for the annotation player to work
	play() {
	   console.debug('play');
	   this.state.froogaloop.api('play');
	}

	pause() {
		console.debug('pause');
		this.state.froogaloop.api('pause');
	}

	unload() {
		this.state.froogaloop.api('unload');
	}

	seek(secs) {
		console.debug('seeking to: ' + secs);
		this.state.froogaloop.api('seekTo', secs);
	}

	getPosition(callback) {
		this.state.froogaloop.api('getCurrentTime', function (value, player_id) {
			callback(value);
		});
	}

	getDuration(callback) {
	   this.state.froogaloop.api('getDuration', function (value, player_id) {
			callback(value)
	   });
	}

	isPaused(callback) {
		this.state.froogaloop.api('paused', function (value, player_id) {
			callback(value);
		});
	}

	//additional optional get functions
	getColor(callback) {
		this.state.froogaloop.api('getColor', function (value, player_id) {
			callback(value);
		});
	}

	getVolume(callback) {
		this.state.froogaloop.api('getVolume', function (value, player_id) {
			callback(value);
		});
	}

	getVideoUrl(callback) {
		this.state.froogaloop.api('getVideoUrl', function (value, player_id) {
			callback(value);
		});
	}

	getVideoEmbedCode(callback) {
		this.state.froogaloop.api('getVideoEmbedCode', function (value, player_id) {
			callback(value);
		});
	}

	getVideoWidth(callback) {
		this.state.froogaloop.api('getVideoWidth', function (value, player_id) {
			callback(value);
		});
	}

	getVideoHeight(callback) {
		this.state.froogaloop.api('getVideoHeight', function (value, player_id) {
			callback(value);
		});
	}

	//additional optional set functions
	setVolume(volume) {
		this.state.froogaloop.api('setVolume', volume);
	}

	setLoop(loop) {
		this.state.froogaloop.api('setLoop', loop ? 1 : 0);
	}

	setColor(color) {//'ff0000'
		this.state.froogaloop.api('setColor', color);
	}

	/*************************************** Player event callbacks ***************************************/

	loadProgress(data) {
		 // console.debug('loadProgress event : ' +
   //          data.percent + ' : ' +
   //          data.bytesLoaded + ' : ' +
   //          data.bytesTotal + ' : ' +
   //          data.duration
   //      );
	}

	playProgress(data) {
		//console.debug('playProgress event : ' + data.seconds + ' : ' + data.percent + ' : ' + data.duration);
		this.getPosition(this.onGetPosition.bind(this));
	}

	onPlay(data) {
		console.debug('play event');
        this.getDuration(this.onGetDuration.bind(this));
        this.setState({paused : false});
	}

	onGetDuration(value) {
		this.setState({duration : value});
		//this.updateBar();
	}

	onPause(paused) {
		console.debug('pause event');
        this.setState({paused : paused});
	}

	onFinish(data) {
		console.debug('finished');
	}

	onSeek(data) {
		console.debug('seek event : ' + data.seconds + ' : ' + data.percent + ' : ' + data.duration);
	}

	onGetPosition(value) {
	    this.setState({curPosition : value});
	    //this.updateBar();
	}

	/************************************** Segmentation controls ***************************************/

	setManualStart(start) {
	    this.setState({start : start});
	    //this.updateBar();
	    this.seek(this.state.start);
	}

	setManualEnd(end) {
	    this.setState({end : end});
	    //this.updateBar();
	    this.seek(this.state.end);
	}

	playStart() {
    	this.seek(this.state.start);
	}

	playEnd() {
    	this.seek(this.state.end);
	}

	setStart(start) {
	    var temp = -1;
	    if(start == undefined) {
	        temp = this.state.curPosition;
	    } else {
	        temp = start;
	    }
	    console.debug(this.state.curPosition + ' S=' + temp + ' E=' + this.state.end);
	    if((this.state.end != -1 && temp < this.state.end) || this.state.end == -1) {
	        this.setState({start : temp});
			//$('#video_start').text(TimeUtil.formatTime(this.state.start));
	        $('#start_time').val(TimeUtil.formatTime(this.state.start));
	        //this.updateBar();
	    } else {
	        alert('The start must be smaller than the end time');
	    }
	}

	setEnd(end, skipPause) {
	    var temp = -1;
	    if(end == undefined) {
	        temp = this.state.curPosition;
	    } else {
	        temp = end;
	    }
	    console.debug(this.state.curPosition + ' S=' + this.state.start + ' E=' + temp);
	    if((this.state.start != -1 && temp > this.state.start) || this.state.start == -1) {
	        this.setState({end : temp});
	        //$('#video_end').text(TimeUtil.formatTime(this.state.end));
	        $('#end_time').val(TimeUtil.formatTime(this.state.end));
	        //this.updateBar();
	        if(skipPause == undefined) {
	            this.pause(true);
	        }
	    } else {
	        alert('The end time must be bigger than the start time');
	    }
	}

	/************************************** Timeline controls ***************************************/

	updateBar() {
		console.debug('updating the timeline');
	}

	render() {
		const controls = {
			setManualStart : this.setManualStart.bind(this),
			setManualEnd : this.setManualEnd.bind(this),
			setStart : this.setStart.bind(this),
			setEnd : this.setEnd.bind(this),
			playStart : this.playStart.bind(this),
			playEnd : this.playEnd.bind(this)
		}
		return (
			<div>
				<div id="video_container">

					<VimeoPlayer/>
					<VideoTimeBar
						duration={this.state.duration}
						curPosition={this.state.curPosition}
						start={this.state.start}
						end={this.state.end}
						seek={this.seek.bind(this)}
					/>
					<SegmentationControls controls={controls}/>

				</div>
			</div>
		)
	}

}

export default AnnotationRecipe;