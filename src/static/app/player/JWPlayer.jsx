import PlayerAPI from './PlayerAPI';

//key: cp1KvUB8slrOvOjg+U8melMoNwxOm/honmDwGg==
//https://developer.jwplayer.com/jw-player/docs/developer-guide/api/javascript_api_reference

class JWPlayer extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			jw : null
		}
	}

	componentDidMount() {
		const jw = jwplayer("video_player").setup({
			file: this.props.mediaObject.url,
			width:'100%',
			controls : true,
			image: null,
			autostart: false,
			key: 'cp1KvUB8slrOvOjg+U8melMoNwxOm/honmDwGg=='
		})
		if(this.props.eventCallbacks) {
			jw.on('bufferChange', this.props.eventCallbacks.loadProgress.bind(this))
			.on('time', this.props.eventCallbacks.playProgress.bind(this))
			.on('play', this.props.eventCallbacks.onPlay.bind(this))
			.on('pause', this.props.eventCallbacks.onPause.bind(this))
			.on('complete', this.props.eventCallbacks.onFinish.bind(this))
			.on('seek', this.props.eventCallbacks.onSeek.bind(this));
		}

		this.setState(
			{jw : jw},
			this.onReady.bind(this)
		);
	}

	onReady() {
		if(this.props.onPlayerReady) {
			this.props.onPlayerReady(new JWPlayerAPI(this.state.jw));
		}
	}

	componentWillUnmount() {
		console.debug('removing the player');
		this.state.jw.remove();
	}

	render() {
		return (<div id="video_player"/>);
	}

}

class JWPlayerAPI extends PlayerAPI {

	constructor(playerAPI) {
		super(playerAPI);
	}

	/* ------------ Implemented API calls ------------- */

	play() {
		this.playerAPI.play();
	}

	pause() {
		this.playerAPI.pause();
	}

	seek(secs) {
		this.playerAPI.seek(secs);
	}

	getPosition(callback) {
		callback(this.playerAPI.getPosition());
	}

	getDuration(callback) {
		callback(this.playerAPI.getDuration());
	}

	isPaused(callback) {
		callback(this.playerAPI.getState() == 'paused');
	}

	/* ----------------------- non-essential player specific calls ----------------------- */

	//TODO
}

export default JWPlayer;