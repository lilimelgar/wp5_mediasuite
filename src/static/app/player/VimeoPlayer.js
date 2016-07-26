import React from 'react';

//FIXME a hard dependancy on froogaloop & jQuery!

class VimeoPlayer extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id="video_player">
				<iframe
					id="player_1"
					src="http://player.vimeo.com/video/7100569?api=1&amp;player_id=player_1"
					width="540"
					height="304"
					frameBorder="0">
				</iframe>
			</div>
		)
	}

}

export default VimeoPlayer;

// const VimeoPlayer = {

// 	_froogaloop : null,

// 	_eventCallbacks : null,

// 	init : function(eventCallbacks) {
// 		this._eventCallbacks = eventCallbacks;
// 		var vimeoPlayers = document.querySelectorAll('iframe');
// 		var vimeoPlayer = null;
// 		for (var i = 0, length = vimeoPlayers.length; i < length; i++) {
// 			vimeoPlayer = vimeoPlayers[i];
// 			$f(vimeoPlayer).addEvent('ready', this.ready.bind(this));
// 		}
// 	},

// 	//called when a vimeo player is loaded
// 	ready : function(player_id) {
// 		this._froogaloop = $f(player_id);
// 		//this.setupEventListeners();
// 		console.debug(this._eventCallbacks);
// 		for(let key in this._eventCallbacks) {
// 			console.debug(key);
// 			this._froogaloop.addEvent(key, this._eventCallbacks[key]);
// 		}
// 	},

// 	//these functions are mandatory for the annotation player to work
// 	play : function() {
// 	   console.debug('play');
// 	   this._froogaloop.api('play');
// 	},
// 	pause : function() {
// 		console.debug('pause');
// 		this._froogaloop.api('pause');
// 	},
// 	unload : function() {
// 		this._froogaloop.api('unload');
// 	},
// 	seek : function(secs) {
// 		console.debug('seeking to: ' + secs);
// 		this._froogaloop.api('seekTo', secs);
// 	},
// 	getPosition: function(callback) {
// 		this._froogaloop.api('getCurrentTime', function (value, player_id) {
// 			callback(value);
// 		});
// 	},
// 	getDuration: function(callback) {
// 	   this._froogaloop.api('getDuration', function (value, player_id) {
// 			callback(value)
// 	   });
// 	},
// 	isPaused: function(callback) {
// 		this._froogaloop.api('paused', function (value, player_id) {
// 			callback(value);
// 		});
// 	},

// 	//additional optional get functions
// 	getColor: function(callback) {
// 		this._froogaloop.api('getColor', function (value, player_id) {
// 			callback(value);
// 		});
// 	},
// 	getVolume: function(callback) {
// 		this._froogaloop.api('getVolume', function (value, player_id) {
// 			callback(value);
// 		});
// 	},
// 	getVideoUrl: function(callback) {
// 		this._froogaloop.api('getVideoUrl', function (value, player_id) {
// 			callback(value);
// 		});
// 	},
// 	getVideoEmbedCode: function(callback) {
// 		this._froogaloop.api('getVideoEmbedCode', function (value, player_id) {
// 			callback(value);
// 		});
// 	},
// 	getVideoWidth: function(callback) {
// 		this._froogaloop.api('getVideoWidth', function (value, player_id) {
// 			callback(value);
// 		});
// 	},
// 	getVideoHeight: function(callback) {
// 		this._froogaloop.api('getVideoHeight', function (value, player_id) {
// 			callback(value);
// 		});
// 	},

// 	//additional optional set functions
// 	setVolume: function(volume) {
// 		this._froogaloop.api('setVolume', volume);
// 	},
// 	setLoop: function(loop) {
// 		this._froogaloop.api('setLoop', loop ? 1 : 0);
// 	},
// 	setColor: function(color) {//'ff0000'
// 		this._froogaloop.api('setColor', color);
// 	}

// }