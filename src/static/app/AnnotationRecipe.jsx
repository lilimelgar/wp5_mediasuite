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
		var mediaObject = {url :'https://www.youtube.com/watch?v=eZCvMpPM2SY'};
		var annotationTarget = AnnotationUtil.generateW3CTargetObject(mediaObject.url);
		this.state = {
			user : 'JaapTest',
			activeAnnotation: null,
			showAnnotationModal : false,
			annotationTarget : annotationTarget,
			playerAPI : null,
			currentPlayer : 'YouTube',
			mediaObject : mediaObject
		}
	}

	/* ------------------------------------------------------------------------------
	------------------------------- VIDEO RELATED FUNCTIONS -------------------------
	------------------------------------------------------------------------------- */

	//whenever the player is ready assign the api to the state. Several components use it as properties
	onPlayerReady(playerAPI) {
		this.setState({playerAPI : playerAPI});
	}

	setAnnotationTarget(event) {
		let mo = null;
		switch(event.target.value) {
			case 'YouTube' : mo = {url : 'https://www.youtube.com/watch?v=eZCvMpPM2SY'};break;
			case 'JW' : mo = {url : 'http://os-immix-w/bascollectie/LEKKERLEZEN__-HRE000554F5_63070000_63839000.mp4'};break;
			case 'Vimeo' : mo = {url : 'http://player.vimeo.com/video/176894130?api=1&amp;player_id=player_1'};break;
		}
		this.setState({
			currentPlayer : event.target.value,
			mediaObject : mo,
			annotationTarget : AnnotationUtil.generateW3CTargetObject(mo.url)
		});
	}

	/* ------------------------------------------------------------------------------
	------------------------------- ANNOTATION RELATED FUNCTIONS --------------------
	------------------------------------------------------------------------------- */

	//overall there can be only one active annotation
	setActiveAnnotation(annotation) {
		this.setState({
			activeAnnotation : annotation
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

	//show the annnotation form with the correct annotation target
	//TODO extend this so the target can also be a piece of text or whatever
	addAnnotationToTarget(targetURI, start, end) {
		let at = AnnotationUtil.generateW3CTargetObject(targetURI, start, end)
		if(at) {
			this.setState({
				showAnnotationModal: true,
				annotationTarget: at,
				activeAnnotation: null
			});
		}
	}

	onSave(annotation) {
		console.debug('so what do I do now?');
		console.debug(annotation);
		// let ans = this.state.annotations;
		// let update = true;
		// for(let i=0;i<ans.length;i++) {
		// 	if(ans[i].id == annotation.id) {
		// 		update = false;
		// 		break;
		// 	}
		// }
		// if(update) {
		// 	ans.push(annotation);
		// 	this.setState({annotations : ans});
		// }
	}

	render() {
		let annotationBox = null;
		let playerOptions = null;
		let supportedPlayers = ['YouTube', 'JW', 'Vimeo'];

		//on the top level we only check if there is any form of annotationSupport
		if(this.props.ingredients.annotationSupport) {
			annotationBox = (
				<AnnotationBox
					showModal={this.state.showAnnotationModal} //show the modal yes/no
					hideAnnotationForm={this.hideAnnotationForm.bind(this)} //pass along the function to hide the modal

					user={this.state.user} //current user
					activeAnnotation={this.state.activeAnnotation} //the active annotation
					annotationTarget={this.state.annotationTarget} //the current target of the active annotation

					annotationModes={this.props.ingredients.annotationModes} //how each annotation mode/motivation is configured

					onSave={this.onSave.bind(this)} //callback function after saving an annotation
				/>
			)
		}

		//temporary
		playerOptions = supportedPlayers.map((player, index) => {
			return (
				<label className="radio-inline" key={'player__' + index}>
					<input
						type="radio"
						name="playerOptions"
						id={player}
						value={player}
						checked={player == this.state.currentPlayer}
						onChange={this.setAnnotationTarget.bind(this)}/>
						{player}
				</label>
			)
		})

		return (
			<div>
				<div className="row">
					<div className="col-md-7">
						<div className="text-left">
							<label>Choose a player:&nbsp;</label>
							{playerOptions}
						</div>
						<br/>
						<FlexPlayer
							user={this.state.user} //current user
							mediaObject={this.state.mediaObject} //currently visible media object

							annotationSupport={this.props.ingredients.annotationSupport} //annotation support the component should provide
							annotationModes={this.props.ingredients.annotationModes} //config for each supported annotation feature
							addAnnotationToTarget={this.addAnnotationToTarget.bind(this)} //each annotation support should call this function

							onPlayerReady={this.onPlayerReady.bind(this)} //returns the playerAPI when the player is ready
						/>
					</div>
					<div className="col-md-5">
						<AnnotationList
							activeAnnotation={this.state.activeAnnotation} //the active annotation
							annotationTarget={this.state.annotationTarget} //the current target of the active annotation

							showAnnotationForm={this.showAnnotationForm.bind(this)} //when double clicking an item open the form
							setAnnotation={this.setActiveAnnotation.bind(this)} //when clicking an item change the active annotation

							playerAPI={this.state.playerAPI} //enables the list to play stuff (probably not needed later on)
						/>

						{annotationBox}
					</div>
				</div>
			</div>
		)
	}

}

export default AnnotationRecipe;