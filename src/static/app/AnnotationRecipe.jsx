import React from 'react';

import TimeUtil from './util/TimeUtil';
import FlexBox from './components/FlexBox';
import FlexPlayer from './player/FlexPlayer';

import AnnotationAPI from './api/AnnotationAPI.js';
import AnnotationBox from './components/annotation/AnnotationBox';
import AnnotationList from './components/annotation/AnnotationList';


//TODO this can later be integrated into Recipe.jsx. It's no longer necessary to have different types of recipes
class AnnotationRecipe extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			user : 'JaapTest',
			annotations: [],
			activeAnnotation: null,
			showAnnotationModal : false,
			playerAPI : null,
			start : null,
			end : null,
			mediaObject : { //later make sure that this can be changed with some selection component
				url : 'http://player.vimeo.com/video/110756897?api=1&amp;player_id=player_1'
			}
		}
	}

	componentDidMount() {
		AnnotationAPI.getAnnotations(function(data) {
			this.onLoadAnnotations(data);
		}.bind(this));
	}

	//this sets the annotations in the state object
	onLoadAnnotations(data) {
		this.setState(data);
	}

	setActiveAnnotation(annotation) {
		this.setState({activeAnnotation : annotation})
	}

	onPlayerReady(playerAPI) {
		this.setState({playerAPI : playerAPI});
	}

	//test to see if it works when setting a new video
	dummyChangeVideo() {
		let mo = {url : 'http://os-immix-w/bascollectie/LEKKERLEZEN__-HRE000554F5_63070000_63839000.mp4'}
		if(this.state.mediaObject.url.indexOf('player.vimeo.com') == -1) {
			mo = {url : 'http://player.vimeo.com/video/176894130?api=1&amp;player_id=player_1'}
		}
		this.setState({
			mediaObject : mo
		});

	}

	handleShowModal() {
		this.setState({showAnnotationModal: true})
	}

	handleHideModal() {
		this.setState({showAnnotationModal: false})
	}

	addAnnotation(annotationTarget, start, end) {
		let at = annotationTarget;
		if(start != -1 && end != -1) {
			at += '#t=' + start + ',' + end;
		}
		if(at) {
			this.setState({
				showAnnotationModal: true,
				annotationTarget: at,
				activeAnnotation: null
			});
		}
	}

	deleteAnnotation(annotationId) {
		AnnotationAPI.deleteAnnotation(annotationId, function(data) {
			this.onDelete(annotationId);
		}.bind(this));
	}

	onDelete(annotationId) {
		var annotations = $.grep(this.state.annotations, function(e){
			return e.annotationId != annotationId;
		});
		this.setState({annotations : annotations});
	}

	onSave(annotation) {
		let ans = this.state.annotations;
		ans.push(annotation);
		this.setState({annotations : ans});
	}

	hasAnnotationSupport() {
		if(this.props.ingredients.annotationSupport != null) {
			if(this.props.ingredients.annotationSupport.mediaObject ||
				this.props.ingredients.annotationSupport.mediaSegment) {
				return true;
			}
		}
		return false;
	}

	/************************************** Timeline controls ***************************************/

	render() {
		let annotationBox = null;
		if(this.hasAnnotationSupport()) {
			annotationBox = (
				<AnnotationBox user={this.state.user}
					playerAPI={this.state.playerAPI}//FIXME dit is een goeie kandidaat voor React context
					annotationModes={this.props.ingredients.annotationModes}
					showModal={this.state.showAnnotationModal}
					annotation={this.state.activeAnnotation}
					annotationTarget={this.state.annotationTarget}
					onSave={this.onSave.bind(this)}
					handleHideModal={this.handleHideModal.bind(this)}
					handleShowModal={this.handleShowModal.bind(this)}/>
			)
		}

		return (
			<div>
				<div className="row">
					<div className="col-md-7">
						<div className="input-group">
							<span className="input-group-btn">
								<button type="button" className="btn btn-info"
									onClick={this.dummyChangeVideo.bind(this)}>
									Andere video
								</button>
							</span>
						</div>

						<FlexPlayer user={this.state.user}
							onPlayerReady={this.onPlayerReady.bind(this)}
							annotationSupport={this.props.ingredients.annotationSupport}
							annotationModes={this.props.ingredients.annotationModes}
							addAnnotation={this.addAnnotation.bind(this)}
							mediaObject={this.state.mediaObject}/>
					</div>
					<div className="col-md-5">
						<AnnotationList
							activeAnnotation={this.state.activeAnnotation}
							annotations={this.state.annotations}
							setAnnotation={this.setActiveAnnotation.bind(this)}
							playerAPI={this.state.playerAPI}
							editAnnotation={this.handleShowModal.bind(this)}
							deleteAnnotation={this.deleteAnnotation.bind(this)}/>

						{annotationBox}
					</div>
				</div>
			</div>
		)
	}

}

export default AnnotationRecipe;