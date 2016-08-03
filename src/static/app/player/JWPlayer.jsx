import React from 'react';

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
			controls : false,
			image: null,
			autostart: false,
			key: 'cp1KvUB8slrOvOjg+U8melMoNwxOm/honmDwGg=='
		})
		.on('bufferChange', this.props.eventCallbacks.loadProgress.bind(this))
		.on('time', this.props.eventCallbacks.playProgress.bind(this))
		.on('play', this.props.eventCallbacks.onPlay.bind(this))
		.on('pause', this.props.eventCallbacks.onPause.bind(this))
		.on('complete', this.props.eventCallbacks.onFinish.bind(this))
		.on('seek', this.props.eventCallbacks.onSeek.bind(this));

		this.setState(
			{jw : jw},
			this.props.onPlayerReady(new JWPlayerAPI(jw))
		);
	}

	componentWillUnmount() {
		console.debug('removing the player');
		this.state.jw.remove();
	}

	render() {
		return (<div id="video_player"/>);
	}

}

//this should implement a generic playerAPI
class JWPlayerAPI {

	constructor(api) {
		this.api = api;
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
		this.api.play();
	}

	pause() {
		this.api.pause();
	}

	seek(secs) {
		this.api.seek(secs);
	}

	getPosition(callback) {
		callback(this.api.getPosition());
	}

	getDuration(callback) {
		callback(this.api.getDuration());
	}

	isPaused(callback) {
		callback(this.api.getState() == 'paused');
	}

	/* ----------------------- non-essential player specific calls ----------------------- */

	//TODO
}

export default JWPlayer;