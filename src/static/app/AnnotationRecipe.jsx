import React from 'react';
import VimeoPlayer from './player/VimeoPlayer';
import VideoTimeBar from './components/annotation/VideoTimeBar';
import AnnotationBox from './components/annotation/AnnotationBox';
import SegmentationControls from './components/annotation/SegmentationControls';
import TimeUtil from './util/TimeUtil';
import FlexBox from './components/FlexBox';
import MouseTrap from 'mousetrap';

class AnnotationRecipe extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			froogaloop : null,//specific API for Vimeo player
			curPosition : 0,
			duration : 0,
			start : -1,
			end : -1,
			paused : true
		}
	}

	//TODO make sure to offer support for rendering different players, now it's just Vimeo (ArtTube needs this)
	componentDidMount() {
		this.initPlayer(this.props.ingredients.playerType);
		this.initKeyBindings();
	}

	initKeyBindings() {
		//Mousetrap.bind(['* k', 'ctrl+r', `up up down down left right left right b a enter`], this.testKey.bind(this));

		Mousetrap.bind('left', function() {
			this.checkFocus.call(this, this.rw, 60);
	    }.bind(this));
	    Mousetrap.bind('right', function() {
	        this.checkFocus.call(this, this.ff, 60);
	    }.bind(this));

	    //pause & play shortcut
	    Mousetrap.bind('space', function() {
	        if(!this.checkFocus.call(this)) {
	            if(this.state.paused) {//FIXME, this does not work yet!
	                this.pause.call(this);
	            } else {
	                this.play.call(this);
	            }
	        }
	    }.bind(this));

	    //start & end shortcuts
	    Mousetrap.bind('i', function() {
	        this.checkFocus.call(this, this.setStart);
	    }.bind(this));
	    Mousetrap.bind('o', function() {
	        this.checkFocus.call(this, this.setEnd);
	    }.bind(this));
	    Mousetrap.bind('shift+i', function() {
	        this.checkFocus.call(this, this.playStart);
	    }.bind(this));
	    Mousetrap.bind('shift+o', function() {
	        this.checkFocus.call(this, this.playEnd);
	    }.bind(this));

	    //anchor functions
	    Mousetrap.bind(']', function() {
	        this.checkFocus.call(this, this.nextAnchor);
	    }.bind(this));
	    Mousetrap.bind('[', function() {
	        this.checkFocus.call(this, this.previousAnchor);
	    }.bind(this));
	    Mousetrap.bind('ctrl+s', function() {
	        this.checkFocus.call(this, this.saveAnchor);
	    }.bind(this));
	    Mousetrap.bind('ctrl+n', function() {
	        this.checkFocus.call(this, this.newAnchor);
	    }.bind(this));

	    //fast forward shortcuts (somehow cannot create these in a loop...)
	    Mousetrap.bind('1', function() {
	        this.checkFocus.call(this, this.ff, 1);
	    }.bind(this));
	    Mousetrap.bind('2', function() {
	        this.checkFocus.call(this, this.ff, 2);
	    }.bind(this));
	    Mousetrap.bind('3', function() {
	        this.checkFocus.call(this, this.ff, 3);
	    }.bind(this));
	    Mousetrap.bind('4', function() {
	        this.checkFocus.call(this, this.ff, 4);
	    }.bind(this));
	    Mousetrap.bind('5', function() {
	        this.checkFocus.call(this, this.ff, 5);
	    }.bind(this));
	    Mousetrap.bind('6', function() {
	        this.checkFocus.call(this, this.ff, 6);
	    }.bind(this));
	    Mousetrap.bind('7', function() {
	        this.checkFocus.call(this, this.ff, 7);
	    }.bind(this));
	    Mousetrap.bind('8', function() {
	        this.checkFocus.call(this, this.ff, 8);
	    }.bind(this));
	    Mousetrap.bind('9', function() {
	        this.checkFocus.call(this, this.ff, 9);
	    }.bind(this));

	    //rewind shortcuts
	    Mousetrap.bind('shift+1', function() {
	        this.checkFocus.call(this, this.rw, 1);
	    }.bind(this));
	    Mousetrap.bind('shift+2', function() {
	        this.checkFocus.call(this, this.rw, 2);
	    }.bind(this));
	    Mousetrap.bind('shift+3', function() {
	        this.checkFocus.call(this, this.rw, 3);
	    }.bind(this));
	    Mousetrap.bind('shift+4', function() {
	        this.checkFocus.call(this, this.rw, 4);
	    }.bind(this));
	    Mousetrap.bind('shift+5', function() {
	        this.checkFocus.call(this, this.rw, 5);
	    }.bind(this));
	    Mousetrap.bind('shift+6', function() {
	        this.checkFocus.call(this, this.rw, 6);
	    }.bind(this));
	    Mousetrap.bind('shift+7', function() {
	        this.checkFocus.call(this, this.rw, 7);
	    }.bind(this));
	    Mousetrap.bind('shift+8', function() {
	        this.checkFocus.call(this, this.rw, 8);
	    }.bind(this));
	    Mousetrap.bind('shift+9', function() {
	        this.checkFocus.call(this, this.rw, 9);
	    }.bind(this));
	}

	checkFocus(f, args) {
	    if($('input').is(':focus')) {
	        return true;
	    }
	    if(f) {
	        f.call(this, args);
	    }
	}

	componentWillUnmount() {

    }

	initPlayer(type) {
		if(type == 'vimeo') {
			//console.debug('Mounted the iframe HTML, rendering the player');
			var vimeoPlayers = document.querySelectorAll('iframe');
			var vimeoPlayer = null;
			for (var i = 0, length = vimeoPlayers.length; i < length; i++) {
				vimeoPlayer = vimeoPlayers[i];
				$f(vimeoPlayer).addEvent('ready', this.vimeoPlayerMounted.bind(this));
			}
		} else {
			console.error('Please specify a valid playerType');
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
		//console.debug('Rendered the player, setting up the player API');
		this.setState({
			froogaloop : $f(playerId)
		});
		for(let key in eventCallbacks) {
			this.state.froogaloop.addEvent(key, eventCallbacks[key]);
		}
	}

	/*************************************** Vimeo player callbacks ***************************************/

	//these functions are mandatory for the annotation player to work
	play() {
	   this.state.froogaloop.api('play');
	}

	pause() {
		this.state.froogaloop.api('pause');
	}

	unload() {
		this.state.froogaloop.api('unload');
	}

	seek(secs) {
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
        this.getDuration(this.onGetDuration.bind(this));
        this.setState({paused : false});
	}

	onGetDuration(value) {
		this.setState({duration : value});
	}

	onPause(paused) {
        this.setState({paused : paused});
	}

	onFinish(data) {

	}

	onSeek(data) {
		//console.debug('seek event : ' + data.seconds + ' : ' + data.percent + ' : ' + data.duration);
	}

	onGetPosition(value) {
	    this.setState({curPosition : value});
	}

	/************************************** Segmentation controls ***************************************/

	setManualStart(start) {
	    this.setState({start : start});
	    this.seek(this.state.start);
	}

	setManualEnd(end) {
	    this.setState({end : end});
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

	rw(t) {
		this.seek(this.state.curPosition - t);
	}

	ff(t) {
		this.seek(this.state.curPosition + t);
	}

	/************************************** Timeline controls ***************************************/

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
				<div className="row">
					<div className="col-md-7">
						<FlexBox>
							<VimeoPlayer/>
						</FlexBox>
					</div>
					<div className="col-md-5">
						<FlexBox>
							<AnnotationBox
								start={this.state.start}
								end={this.state.end}
								seek={this.seek.bind(this)}
							/>
						</FlexBox>
					</div>
				</div>
				<div className="row">
					<div className="col-md-7">
						<FlexBox>
							<VideoTimeBar
								duration={this.state.duration}
								curPosition={this.state.curPosition}
								start={this.state.start}
								end={this.state.end}
								seek={this.seek.bind(this)}
							/>
							<br/><br/>
							<SegmentationControls controls={controls}/>
						</FlexBox>
					</div>
				</div>
			</div>
		)
	}

}

export default AnnotationRecipe;