// Listen for the ready event for any vimeo video players on the page
var vimeoPlayers = document.querySelectorAll('iframe');
var vimeoPlayer = null;
for (var i = 0, length = vimeoPlayers.length; i < length; i++) {
	vimeoPlayer = vimeoPlayers[i];
	$f(vimeoPlayer).addEvent('ready', ready);
}

//called when a vimeo player is loaded
function ready(player_id) {
	// Keep a reference to Froogaloop for this player
	var container = document.getElementById(player_id).parentNode.parentNode;
	var froogaloop = $f(player_id);

	//start setting up the global player object
	_player = {

		//these functions are mandatory for the annotation player to work
		play : function() {
		   console.debug('play');
		   froogaloop.api('play');
		},
		pause : function() {
			console.debug('pause');
			froogaloop.api('pause');
		},
		unload : function() {
			froogaloop.api('unload');
		},
		seek : function(secs) {
			console.debug('seeking to: ' + secs);
			froogaloop.api('seekTo', secs);
		},
		getPosition: function(callback) {
			froogaloop.api('getCurrentTime', function (value, player_id) {
				callback(value);
			});
		},
		getDuration: function(callback) {
		   froogaloop.api('getDuration', function (value, player_id) {
				callback(value)
		   });
		},
		isPaused: function(callback) {
			froogaloop.api('paused', function (value, player_id) {
				callback(value);
			});
		},

		//additional optional get functions
		getColor: function(callback) {
			froogaloop.api('getColor', function (value, player_id) {
				callback(value);
			});
		},
		getVolume: function(callback) {
			froogaloop.api('getVolume', function (value, player_id) {
				callback(value);
			});
		},
		getVideoUrl: function(callback) {
			froogaloop.api('getVideoUrl', function (value, player_id) {
				callback(value);
			});
		},
		getVideoEmbedCode: function(callback) {
			froogaloop.api('getVideoEmbedCode', function (value, player_id) {
				callback(value);
			});
		},
		getVideoWidth: function(callback) {
			froogaloop.api('getVideoWidth', function (value, player_id) {
				callback(value);
			});
		},
		getVideoHeight: function(callback) {
			froogaloop.api('getVideoHeight', function (value, player_id) {
				callback(value);
			});
		},

		//additional optional set functions
		setVolume: function(volume) {
			froogaloop.api('setVolume', volume);
		},
		setLoop: function(loop) {
			froogaloop.api('setLoop', loop ? 1 : 0);
		},
		setColor: function(color) {//'ff0000'
			froogaloop.api('setColor', color);
		}

	}

	//hook up the vimeo events to the callback functions in player-controls.js
	function setupEventListeners() {
		froogaloop.addEvent('loadProgress', function(data) {
			onLoadProgress(data);
		});

		froogaloop.addEvent('playProgress', function(data) {
			onPlayProgress(data);
		});

		froogaloop.addEvent('play', function(data) {
			onPlay(data);
		});

		froogaloop.addEvent('pause', function(data) {
			onPause(data);
		});

		froogaloop.addEvent('finish', function(data) {
			onFinish(data);
		});

		froogaloop.addEvent('seek', function(data) {
			onSeek(data);
		});

	}

	/**
	 * Sets up actions for buttons that will ask the player for something,
	 * such as the current time or duration. These methods require a
	 * callback function which will be called with any data as the first
	 * parameter in that function.
	 */
	function setupGetterButtons() {
		var buttons = container.querySelector('div dl.getters'),
			timeBtn = buttons.querySelector('.time'),
			durationBtn = buttons.querySelector('.duration'),
			colorBtn = buttons.querySelector('.color'),
			urlBtn = buttons.querySelector('.url'),
			embedBtn = buttons.querySelector('.embed'),
			pausedBtn = buttons.querySelector('.paused'),
			getVolumeBtn = buttons.querySelector('.getVolume'),
			widthBtn = buttons.querySelector('.width'),
			heightBtn = buttons.querySelector('.height');
		// Get the current time and log it to the API console when time button clicked
		addEvent(timeBtn, 'click', function(e) {
			froogaloop.api('getCurrentTime', function (value, player_id) {
				// Log out the value in the API Console
				apiLog('getCurrentTime : ' + value);
			});
		}, false);
		// Get the duration and log it to the API console when time button clicked
		addEvent(durationBtn, 'click', function(e) {
			froogaloop.api('getDuration', function (value, player_id) {
				// Log out the value in the API Console
				apiLog('getDuration : ' + value);
			});
		}, false);
		// Get the embed color and log it to the API console when time button clicked
		addEvent(colorBtn, 'click', function(e) {
			froogaloop.api('getColor', function (value, player_id) {
				// Log out the value in the API Console
				apiLog('getColor : ' + value);
			});
		}, false);
		// Get the video url and log it to the API console when time button clicked
		addEvent(urlBtn, 'click', function(e) {
			froogaloop.api('getVideoUrl', function (value, player_id) {
				// Log out the value in the API Console
				apiLog('getVideoUrl : ' + value);
			});
		}, false);
		// Get the embed code and log it to the API console when time button clicked
		addEvent(embedBtn, 'click', function(e) {
			froogaloop.api('getVideoEmbedCode', function (value, player_id) {
				// Use html entities for less-than and greater-than signs
				value = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
				// Log out the value in the API Console
				apiLog('getVideoEmbedCode : ' + value);
			});
		}, false);
		// Get the paused state and log it to the API console when time button clicked
		addEvent(pausedBtn, 'click', function(e) {
			froogaloop.api('paused', function (value, player_id) {
				// Log out the value in the API Console
				apiLog('paused : ' + value);
			});
		}, false);
		// Get the paused state and log it to the API console when time button clicked
		addEvent(getVolumeBtn, 'click', function(e) {
			froogaloop.api('getVolume', function (value, player_id) {
				// Log out the value in the API Console
				apiLog('volume : ' + value);
			});
		}, false);
		// Get the paused state and log it to the API console when time button clicked
		addEvent(widthBtn, 'click', function(e) {
			froogaloop.api('getVideoWidth', function (value, player_id) {
				// Log out the value in the API Console
				apiLog('getVideoWidth : ' + value);
			});
		}, false);
		// Get the paused state and log it to the API console when time button clicked
		addEvent(heightBtn, 'click', function(e) {
			froogaloop.api('getVideoHeight', function (value, player_id) {
				// Log out the value in the API Console
				apiLog('getVideoHeight : ' + value);
			});
		}, false);
	}



	setupEventListeners();

}