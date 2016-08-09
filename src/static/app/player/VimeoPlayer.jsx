import PlayerAPI from './PlayerAPI';

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

class VimeoAPI extends PlayerAPI {

	constructor(playerAPI) {
		super(playerAPI);
	}

	/* ------------ Implemented API calls ------------- */

	play() {
		this.playerAPI.api('play');
	}

	pause() {
		this.playerAPI.api('pause');
	}

	seek(secs) {
		this.playerAPI.api('seekTo', secs);
	}

	getPosition(callback) {
		this.playerAPI.api('getCurrentTime', function (value, player_id) {
			callback(value);
		});
	}

	getDuration(callback) {
	   this.playerAPI.api('getDuration', function (value, player_id) {
			callback(value)
	   });
	}

	isPaused(callback) {
		this.playerAPI.api('paused', function (value, player_id) {
			callback(value);
		});
	}

	/* ----------------------- non-essential player specific calls ----------------------- */

	unload() {
		this.playerAPI.api('unload');
	}

	getColor(callback) {
		this.playerAPI.api('getColor', function (value, player_id) {
			callback(value);
		});
	}

	getVolume(callback) {
		this.playerAPI.api('getVolume', function (value, player_id) {
			callback(value);
		});
	}

	getVideoUrl(callback) {
		this.playerAPI.api('getVideoUrl', function (value, player_id) {
			callback(value);
		});
	}

	getVideoEmbedCode(callback) {
		this.playerAPI.api('getVideoEmbedCode', function (value, player_id) {
			callback(value);
		});
	}

	getVideoWidth(callback) {
		this.playerAPI.api('getVideoWidth', function (value, player_id) {
			callback(value);
		});
	}

	getVideoHeight(callback) {
		this.playerAPI.api('getVideoHeight', function (value, player_id) {
			callback(value);
		});
	}

	//additional optional set functions
	setVolume(volume) {
		this.playerAPI.api('setVolume', volume);
	}

	setLoop(loop) {
		this.playerAPI.api('setLoop', loop ? 1 : 0);
	}

	setColor(color) {//'ff0000'
		this.playerAPI.api('setColor', color);
	}
}

export default VimeoPlayer;