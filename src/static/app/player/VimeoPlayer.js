import React from 'react';

//this is the first player that is supported in LABO (ArtTube requires Vimeo)

class VimeoPlayer extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			froogaloop : null
		}
	}

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
			loadProgress : this.props.eventCallbacks.loadProgress.bind(this),
		    playProgress : this.props.eventCallbacks.playProgress.bind(this),
		    play : this.props.eventCallbacks.onPlay.bind(this),
		    pause : this.props.eventCallbacks.onPause.bind(this),
		    finish : this.props.eventCallbacks.onFinish.bind(this),
		    seek : this.props.eventCallbacks.onSeek.bind(this)
		}
		//console.debug('Rendered the player, setting up the player API');
		this.setState({
			froogaloop : $f(playerId)
		});
		for(let key in eventCallbacks) {
			this.state.froogaloop.addEvent(key, eventCallbacks[key]);
		}
		//send back the api to the owning component
		this.props.onPlayerReady(new VimeoAPI(this.state.froogaloop));
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

	setActiveSegment(activeSegment, play, notify) {
		this.activeSegment = activeSegment;
		if(play) {
			this.seek(activeSegment.start)
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

	unload() {
		this.froogaloop.api('unload');
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

	//additional optional get functions
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