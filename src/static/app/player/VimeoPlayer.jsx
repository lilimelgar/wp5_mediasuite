import React from 'react';

//this is the first player that is supported in LABO (ArtTube requires Vimeo)
//https://github.com/vimeo/player.js

class VimeoPlayer extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			froogaloop : null
		}
	}

	componentDidMount() {
		var vimeoPlayers = document.querySelectorAll('iframe');
		var vimeoPlayer = null;
		for (var i = 0, length = vimeoPlayers.length; i < length; i++) {
			vimeoPlayer = vimeoPlayers[i];

			$f(vimeoPlayer).addEvent('ready', this.playerReady.bind(this));
		}
	}

	componentWillUnmount() {
		this.state.froogaloop.api('unload');
		this.setState({froogaloop : null});
	}

	playerReady(playerId) {
		this.setState({
			froogaloop : $f(playerId)
		}, this.setupEventCallbacks.bind(this));
	}

	setupEventCallbacks() {
		if(this.props.eventCallbacks) {
			const eventCallbacks = {
				loadProgress : this.props.eventCallbacks.loadProgress.bind(this),
			    playProgress : this.props.eventCallbacks.playProgress.bind(this),
			    play : this.props.eventCallbacks.onPlay.bind(this),
			    pause : this.props.eventCallbacks.onPause.bind(this),
			    finish : this.props.eventCallbacks.onFinish.bind(this),
			    seek : this.props.eventCallbacks.onSeek.bind(this)
			}
			for(let key in eventCallbacks) {
				this.state.froogaloop.addEvent(key, eventCallbacks[key]);
			}
		}
		if(this.props.onPlayerReady) {
			//send back the api to the owning component
			this.props.onPlayerReady(new VimeoAPI(this.state.froogaloop));
		}
	}

	render() {
		return (
			<div id="video_player">
				<iframe
					id="player_1"
					src={this.props.mediaObject.url}
					width="540"
					height="304"
					frameBorder="0">
				</iframe>
			</div>
		)
	}

}

//this should implement a generic playerAPI
class VimeoAPI {

	constructor(froogaloop) {
		this.froogaloop = froogaloop;
		this.activeSegment = null;
		this.observers = [];
	}

	/* ------------ These functions should be in a super class ------------- */

	addObserver(obj) {
		this.observers.push(obj);
	}

	removeObserver(obj) {
		this.observers.splice(this.observers.indexOf(obj), 1);
	}

	notifyObservers() {
		for(let i=0;i<this.observers.length;i++) {
			this.observers[i].update();
		}
	}

	getActiveSegment() {
		return this.activeSegment;
	}

	//TODO this should also include the video url, so it can switch video!!!
	setActiveSegment(activeSegment, play, notify) {
		if(activeSegment) {
			this.activeSegment = activeSegment;
		} else {
			this.activeSegment = {start : 0, end : 0};
		}
		if(play) {
			this.seek(this.activeSegment.start)
		}
		if(notify) {
			this.notifyObservers();
		}
	}

	/* ------------ Implemented API calls ------------- */

	play() {
		this.froogaloop.api('play');
	}

	pause() {
		this.froogaloop.api('pause');
	}

	seek(secs) {
		this.froogaloop.api('seekTo', secs);
	}

	getPosition(callback) {
		this.froogaloop.api('getCurrentTime', function (value, player_id) {
			callback(value);
		});
	}

	getDuration(callback) {
	   this.froogaloop.api('getDuration', function (value, player_id) {
			callback(value)
	   });
	}

	isPaused(callback) {
		this.froogaloop.api('paused', function (value, player_id) {
			callback(value);
		});
	}

	/* ----------------------- non-essential player specific calls ----------------------- */

	unload() {
		this.froogaloop.api('unload');
	}

	getColor(callback) {
		this.froogaloop.api('getColor', function (value, player_id) {
			callback(value);
		});
	}

	getVolume(callback) {
		this.froogaloop.api('getVolume', function (value, player_id) {
			callback(value);
		});
	}

	getVideoUrl(callback) {
		this.froogaloop.api('getVideoUrl', function (value, player_id) {
			callback(value);
		});
	}

	getVideoEmbedCode(callback) {
		this.froogaloop.api('getVideoEmbedCode', function (value, player_id) {
			callback(value);
		});
	}

	getVideoWidth(callback) {
		this.froogaloop.api('getVideoWidth', function (value, player_id) {
			callback(value);
		});
	}

	getVideoHeight(callback) {
		this.froogaloop.api('getVideoHeight', function (value, player_id) {
			callback(value);
		});
	}

	//additional optional set functions
	setVolume(volume) {
		this.froogaloop.api('setVolume', volume);
	}

	setLoop(loop) {
		this.froogaloop.api('setLoop', loop ? 1 : 0);
	}

	setColor(color) {//'ff0000'
		this.froogaloop.api('setColor', color);
	}
}

export default VimeoPlayer;