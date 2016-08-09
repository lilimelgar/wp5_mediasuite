import React from 'react';

import TimeUtil from './util/TimeUtil';
import FlexBox from './components/FlexBox';
import FlexPlayer from './player/FlexPlayer';

import AnnotationAPI from './api/AnnotationAPI';
import AnnotationUtil from './util/AnnotationUtil'
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
			annotationTarget : null,
			playerAPI : null,
			start : null,
			end : null,
			mediaObject : { //later make sure that this can be changed with some selection component
				url : 'https://www.youtube.com/watch?v=eZCvMpPM2SY'
			}
		}
	}

	componentDidMount() {
		AnnotationAPI.getAnnotations(function(data) {
			this.onLoadAnnotations(data);
		}.bind(this));
	}

	/* ------------------------------------------------------------------------------
	------------------------------- VIDEO RELATED FUNCTIONS -------------------------
	------------------------------------------------------------------------------- */

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

	//whenever the player is ready assign the api to the state. Several components use it as properties
	onPlayerReady(playerAPI) {
		this.setState({playerAPI : playerAPI});
	}

	/* ------------------------------------------------------------------------------
	------------------------------- ANNOTATION RELATED FUNCTIONS --------------------
	------------------------------------------------------------------------------- */

	//this sets the annotations in the state object
	onLoadAnnotations(annotationData) {
		this.setState(annotationData);
	}

	//overall there can be only one active annotation
	setActiveAnnotation(annotation) {
		this.setState({
			activeAnnotation : annotation,
			annotationTarget : annotation.target
		})
	}

	//shows the annotation modal
	showAnnotationForm() {
		this.setState({showAnnotationModal: true})
	}

	//hides the annotation modal
	hideAnnotationForm() {
		this.setState({showAnnotationModal: false})
	}

	addAnnotation(targetURI, start, end) {
		let at = AnnotationUtil.generateW3CTargetObject(targetURI, start, end)
		if(at) {
			this.setState({
				showAnnotationModal: true,
				annotationTarget: at,
				activeAnnotation: null
			});
		}
	}

	//TODO this function has to know everything about where the annotation target is and be able to
	//redirect the user to it
	playAnnotation(annotation) {
		if(annotation.target.source.indexOf(this.state.mediaObject.url) != -1) {
			let interval = AnnotationUtil.extractMediaFragmentFromURI(annotation.target.source);
			if(interval) {
				this.state.playerAPI.setActiveSegment({
					start : interval[0], end : interval[1]
				}, true, true);
			} else {
				this.state.playerAPI.setActiveSegment(null, true, true);
			}
		} else {
			console.debug('Currently a completely different annotation target is loaded');
		}
	}

	deleteAnnotation(annotationId) {
		AnnotationAPI.deleteAnnotation(annotationId, function(data) {
			this.onDelete(annotationId);
		}.bind(this));
	}

	onDelete(annotationId) {
		var annotations = $.grep(this.state.annotations, function(e){
			return e.id != annotationId;
		});
		this.setState({annotations : annotations});
	}

	onSave(annotation) {
		let ans = this.state.annotations;
		let update = true;
		for(let i=0;i<ans.length;i++) {
			if(ans[i].id == annotation.id) {
				update = false;
				break;
			}
		}
		if(update) {
			ans.push(annotation);
			this.setState({annotations : ans});
		}
	}

	render() {
		let annotationBox = null;

		//on the top level we only check if there is any form of annotationSupport
		if(this.props.ingredients.annotationSupport) {
			annotationBox = (
				<AnnotationBox
					showModal={this.state.showAnnotationModal} //show the modal yes/no
					hideAnnotationForm={this.hideAnnotationForm.bind(this)} //pass along the function to hide the modal

					user={this.state.user} //current user
					activeAnnotation={this.state.activeAnnotation} //the active annotation
					annotationTarget={this.state.annotationTarget} //the current target of the active annotation (merge?)

					annotationModes={this.props.ingredients.annotationModes} //how each annotation mode/motivation is configured

					onSave={this.onSave.bind(this)} //callback function after saving an annotation
				/>
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

						<FlexPlayer
							user={this.state.user} //current user
							mediaObject={this.state.mediaObject} //currently visible media object

							annotationSupport={this.props.ingredients.annotationSupport} //annotation support the component should provide
							annotationModes={this.props.ingredients.annotationModes} //config for each supported annotation feature
							addAnnotation={this.addAnnotation.bind(this)} //each annotation support should call this function

							onPlayerReady={this.onPlayerReady.bind(this)} //returns the playerAPI when the player is ready
						/>
					</div>
					<div className="col-md-5">
						<AnnotationList
							activeAnnotation={this.state.activeAnnotation} //the active annotation
							annotations={this.state.annotations} //the list of annotations TODO move this to the list itself

							showAnnotationForm={this.showAnnotationForm.bind(this)} //when double clicking an item open the form
							setAnnotation={this.setActiveAnnotation.bind(this)} //when clicking an item change the active annotation
							deleteAnnotation={this.deleteAnnotation.bind(this)} //when clicking X, remove the annotation

							playAnnotation={this.playAnnotation.bind(this)} //when clicking 'play' on an annotation
						/>

						{annotationBox}
					</div>
				</div>
			</div>
		)
	}

}

export default AnnotationRecipe;