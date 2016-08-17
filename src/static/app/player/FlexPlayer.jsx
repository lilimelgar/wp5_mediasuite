import React from 'react';
import VimeoPlayer from './VimeoPlayer';
import JWPlayer from './JWPlayer';
import YouTubePlayer from './YouTubePlayer';
import VideoTimeBar from '../components/annotation/VideoTimeBar';
import SegmentationControls from '../components/annotation/SegmentationControls';
import TimeUtil from '../util/TimeUtil';
import FlexBox from '../components/FlexBox';
import MouseTrap from 'mousetrap';
import AnnotationUtil from '../util/AnnotationUtil';

/*
This class receives a (generic) playerAPI from the implementing player component.
Currently VimeoPlayer.jsx and JWPlayer.jsx have implemented this API.

It is able to pass the playerAPI to its owner. This is useful e.g. for the current AnnotationRecipe,
who needs to pass on this API to the AnnotationBox (so it's possible to seek the video when clicking on an annotation)

TODO: it must be possible to fetch all of the annotations made on this mediaObject. The Annotation API must be extended
*/

class FlexPlayer extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			playerAPI : null,
			curPosition : 0,
			duration : 0,
			start : -1,
			end : -1,
			paused : true,//FIXME call the player API instead (isPaused)?
			fragmentMode : false,

			//this could be part of a super class
			annotations : this.props.mediaObject.annotations ? this.props.mediaObject.annotations : [],
			currentAnnotation : null
		}
	}

	//TODO make sure to offer support for rendering different players, now it's just Vimeo (ArtTube needs this)
	componentDidMount() {
		this.initKeyBindings();
	}

	onPlayerReady(playerAPI) {
		playerAPI.addObserver(this);
		this.setState(
			{playerAPI : playerAPI}
		);
		//pass on the API to the owner
		if(this.props.onPlayerReady) {
			this.props.onPlayerReady(playerAPI);
		}
	}

	checkFocus(f, args) {
	    if($('input').is(':focus')) {
	        return true;
	    }
	    if(f) {
	        f.call(this, args);
	    }
	}

	//called by the playerAPI (this component is an observer of that. I know it's ugly, will make it pretty later)
	update() {
		let activeSegment = this.state.playerAPI.getActiveSegment();
		this.setState({
			start : activeSegment.start,
			end : activeSegment.end
		})
	}

	/*************************************** Player event callbacks ***************************************/

	playProgress(data) {
		this.state.playerAPI.getPosition(this.onGetPosition.bind(this));
	}

	onPlay(data) {
        this.state.playerAPI.getDuration(this.onGetDuration.bind(this));
        this.setState({paused : false});
	}

	onGetDuration(value) {
		this.setState({duration : value});
	}

	onPause(paused) {
        this.setState({paused : true});
	}

	onGetPosition(value) {
	    this.setState({curPosition : value});
	}

	loadProgress(data) {
		//TODO do something with this?
	}

	onFinish(data) {
		//TODO do something with this?
	}

	onSeek(data) {
		//TODO do something with this?
	}

	/************************************** Segmentation controls ***************************************/

	setManualStart(start) {
	    this.setState({start : start});
	    this.state.playerAPI.seek(this.state.start);
	}

	setManualEnd(end) {
	    this.setState({end : end});
	    this.state.playerAPI.seek(this.state.end);
	}

	playStart() {
    	this.state.playerAPI.seek(this.state.start);
	}

	playEnd() {
    	this.state.playerAPI.seek(this.state.end);
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
	        if(skipPause == undefined) {
	            this.state.playerAPI.pause();
	        }
	    } else {
	        alert('The end time must be bigger than the start time');
	    }
	}

	rw(t) {
		this.state.playerAPI.seek(this.state.curPosition - t);
	}

	ff(t) {
		this.state.playerAPI.seek(this.state.curPosition + t);
	}

	//Note: for now the fragment mode only enables the user to inspect the current
	//fragment in isolation (only the VideoTimeBar is changed to show only the active segment)
	switchMode() {
		if(this.state.start != -1 && this.state.end != -1) {
			if(this.state.fragmentMode === false) {
				this.playStart();
				//TODO make it play after switching!
			}
			this.setState({fragmentMode : !this.state.fragmentMode});
		} else {
			alert('You can only switch to fragment mode when you have an active start & end point set');
		}
	}

	/************************************** Keyboard controls ***************************************/

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
	            if(this.state.paused === false) {//FIXME, this does not work yet!
	                this.state.playerAPI.pause();
	            } else {
	                this.state.playerAPI.play();
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

	    Mousetrap.bind('shift+f', function() {
	    	this.checkFocus.call(this, this.switchMode);
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

	/* ------------------------------------------------------------------------------
	------------------------------- COMMUNICATION WITH OWNER/RECIPE -----------------
	------------------------------------------------------------------------------- */

	//TODO assign the current media Object as target
	setActiveAnnotationTarget(annotationTarget) {
		if(this.props.setActiveAnnotationTarget) {
			this.props.setActiveAnnotationTarget(annotationTarget);
		}
	}

	//TODO implement this. It should be able to play the based on the props.playingAnnotation
	playAnnotation(annotation) {
		console.debug('to be implemented: playAnnotation()');
		// if(this.props.annotationTarget) {
		// 	//TODO make sure to check the mimeType and also add support for images/spatial targets!!
		// 	if(annotation.target.source == this.props.annotationTarget.source) {
		// 		let interval = AnnotationUtil.extractTemporalFragmentFromURI(annotation.target.selector);
		// 		if(interval) {
		// 			this.props.playerAPI.setActiveSegment({
		// 				start : interval[0], end : interval[1]
		// 			}, true, true);
		// 		} else {
		// 			this.props.playerAPI.setActiveSegment(null, true, true);
		// 		}
		// 	} else {
		// 		console.debug('Currently a completely different annotation target is loaded');
		// 	}
		// } else {
		// 	console.debug('Currently there is no annotation target defined!');
		// }
	}


	/* ----------------- just rendering --------------------- */

	render() {
		//update the activeSegment in the playerAPI
		if(this.state.start != -1 && this.state.end != -1 && this.state.playerAPI) {
			this.state.playerAPI.setActiveSegment({
				start : this.state.start,
				end : this.state.end
			});
		}


		let videoAnnotationButton = null;
		let segmentAnnotationButton = null;

		//TODO call the AnnotationUtil to generate a new annotation with a target
		if(this.props.editAnnotation && this.props.annotationSupport) {
			if(this.props.annotationSupport.mediaObject) {
				let annotation = AnnotationUtil.generateW3CEmptyAnnotation(
					this.props.user,
					this.props.mediaObject.url,
					this.props.mediaObject.mimeType
				);

				videoAnnotationButton = (
				<button type="button" className="btn btn-default"
					onClick={this.props.editAnnotation.bind(this, annotation)}>
					Annoteer Video
				</button>);
			}
			if(this.props.annotationSupport.mediaSegment) {
				let annotation = AnnotationUtil.generateW3CEmptyAnnotation(
					this.props.user,
					this.props.mediaObject.url,
					this.props.mediaObject.mimeType,
					{
						start : this.state.start,
						end : this.state.end
					}
				);
				segmentAnnotationButton = (
					<button type="button" className="btn btn-default"
						onClick={this.props.editAnnotation.bind(this, annotation)}>
						Annoteer Segment
					</button>);
			}
		}

		const controls = {
			setManualStart : this.setManualStart.bind(this),
			setManualEnd : this.setManualEnd.bind(this),
			setStart : this.setStart.bind(this),
			setEnd : this.setEnd.bind(this),
			playStart : this.playStart.bind(this),
			playEnd : this.playEnd.bind(this)
		}

		const playerEventCallbacks = {
		    playProgress : this.playProgress.bind(this),
		    onPlay : this.onPlay.bind(this),
		    onPause : this.onPause.bind(this),
		    onFinish : this.onFinish.bind(this),
		    loadProgress : this.loadProgress.bind(this),
		    onSeek : this.onSeek.bind(this)
		}

		let player = null;
		if(this.props.mediaObject) {
			if(this.props.mediaObject.url.indexOf('player.vimeo.com') != -1)  {
				player = (
					<VimeoPlayer mediaObject={this.props.mediaObject}
					eventCallbacks={playerEventCallbacks}
					onPlayerReady={this.onPlayerReady.bind(this)}/>
				);
			} else if (this.props.mediaObject.url.indexOf('.mp4') != -1) {
				player = (
					<JWPlayer mediaObject={this.props.mediaObject}
					eventCallbacks={playerEventCallbacks}
					onPlayerReady={this.onPlayerReady.bind(this)}/>
				);
			} else if (this.props.mediaObject.url.indexOf('youtube.com') != -1) {
				player = (
					<YouTubePlayer mediaObject={this.props.mediaObject}
					eventCallbacks={playerEventCallbacks}
					onPlayerReady={this.onPlayerReady.bind(this)}/>
				);
			} else if (this.props.mediaObject.mimeType.indexOf('audio') != -1) { //later possibly change the audio player
				player = (
					<JWPlayer mediaObject={this.props.mediaObject}
					eventCallbacks={playerEventCallbacks}
					onPlayerReady={this.onPlayerReady.bind(this)}/>
				);
			}
		}

		return (
			<div>
				<div className="row">
					<div className="col-md-12">
						<div>
							{player}
						</div>
						<div className="input-group">
							<span className="input-group-btn">
								{videoAnnotationButton}
								{segmentAnnotationButton}
							</span>
						</div>
					</div>
				</div>
				{this.state.playerAPI ?
					<div className="row">
						<div className="col-md-12">
							<div>
								<VideoTimeBar
									mediaObjectId={this.props.mediaObjectId}
									duration={this.state.duration}
									curPosition={this.state.curPosition}
									start={this.state.start}
									end={this.state.end}
									playerAPI={this.state.playerAPI}
									fragmentMode={this.state.fragmentMode}/>
								<br/>
								<br/>
								<SegmentationControls controls={controls}
									start={this.state.start}
									end={this.state.end}/>
							</div>
						</div>
					</div> : null}
			</div>
		)
	}

}

export default FlexPlayer;