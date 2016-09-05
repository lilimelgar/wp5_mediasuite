import React from 'react';

//import AppDispatcher from './flux/AppDispatcher';

import TimeUtil from './util/TimeUtil';

import FlexBox from './components/FlexBox';
import FlexPlayer from './components/player/video/FlexPlayer';
import FlexImageViewer from './components/player/image/FlexImageViewer';

import SearchAPI from './api/SearchAPI';

import AnnotationAPI from './api/AnnotationAPI';
import AnnotationUtil from './util/AnnotationUtil'
import AnnotationBox from './components/annotation/AnnotationBox';
import AnnotationList from './components/annotation/AnnotationList';

import AnnotationActions from './flux/AnnotationActions';

import CollectionUtil from './util/CollectionUtil';
import CollectionDataUtil from './util/CollectionDataUtil';


/*TODO erg veel nakijkwerk:
	- het maken van annotaties moet echt goed nagelopen worden (werkt het ook nog in de flexplayer? bij de search?)
	- mongoDB moet op blofeld worden geinstalleerd (+ update annotatie API)
	- de flow + het formaat van annotatie data vanaf server door componenten moet handiger
	- video annotatie voor arttube. De functionaliteiten moeten erg goed werken. + met welke data moet er geannoteerd worden...


	DIT MOET IK IMPLEMENTEREN!!!! http://blog.andrewray.me/flux-for-stupid-people/
*/



class ItemDetailsRecipe extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			user : 'JaapTest',
			showAnnotationModal : false,
			itemData : null,
			activeMediaTab : -1,

			playingAnnotation: null,
			activeAnnotation: null,
			annotationTarget : null,

		}
		this.tabListeners = false;
	}

	//TODO now make sure to render all of the correct media objects on the screen and voila
	componentDidMount() {
		console.debug(this.props.params);
		if(this.props.params.id && this.props.params.cid) {
			console.debug('getting the item details');
			SearchAPI.getItemDetails(
				this.props.params.cid,
				this.props.params.id,
				this.onLoadItemData.bind(this)
			);
		}
	}

	componentDidUpdate() {
		if(!this.tabListeners) {
				$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
				var target = $(e.target).attr("href") // activated tab
				var index = target.substring('#mo__'.length);
				console.debug(index);
				var mediaObject = this.state.itemData.playableContent[index];
				if(mediaObject) {
					let annotation = AnnotationUtil.generateW3CEmptyAnnotation(
						this.state.user,
						mediaObject.url,
						mediaObject.mimeType
					);
					this.setActiveAnnotationTarget.call(this, annotation.target);
				} else {
					console.error('there is no valid target?');
				}
			}.bind(this));
			this.tabListeners = true;
		}
	}

	onLoadItemData(collectionId, itemId, data) {
		var config = CollectionUtil.determineConfig(collectionId);
		data = CollectionDataUtil.formatSearchResult(data);//first format the data to component compatible objects
		data = config.getItemDetailData(data);//then format/amend this data further with collection config intelligence
		this.setState({itemData : data});
	}

	/* ------------------------------------------------------------------------------
	------------------------------- ANNOTATION RELATED FUNCTIONS --------------------
	------------------------------------------------------------------------------- */

	setActiveAnnotationTarget(annotationTarget) {
		console.debug(annotationTarget);
		this.setState(
			{annotationTarget : annotationTarget}
		);
		AnnotationActions.changeTarget(annotationTarget)
	}

	playAnnotation(annotation) {
		console.debug('playing annotation');
		this.setState({playingAnnotation : annotation});
		//TODO implement the rendering stuff
	}

	//overall there can be only one active annotation
	setActiveAnnotation(annotation) {
		this.setState({
			activeAnnotation : annotation
		})
	}

	//shows the annotation modal
	showAnnotationForm() {
		this.setState({showAnnotationModal: true});
	}

	//hides the annotation modal
	hideAnnotationForm() {
		this.setState({showAnnotationModal: false});
	}

	//show the annnotation form with the correct annotation target
	//TODO extend this so the target can also be a piece of text or whatever
	editAnnotation(annotation) {
		console.debug(annotation);
		//TODO this should simply always just set the active annotation
		//an annotation ALWAYS has a target, but not always a body or ID (in case of a new annotation)
		if(annotation.target) {
			this.setState({
				showAnnotationModal: true,
				annotationTarget: annotation.target,
				activeAnnotation: annotation
			});
		}
	}

	//TODO pass it on
	onSave(annotation) {
		console.debug('so what do I do now?');
		console.debug(annotation);
	}

	render() {
		let annotationBox = null;
		let annotationList = null;
		let uniqueMetadata = null;
		let metadataPanel = null;
		let mediaPanel = null;
		let mediaTabs = null;
		let mediaTabContents = null;

		if(!this.state.itemData) {
			console.debug('loading metadata');
		} else {

			//on the top level we only check if there is any form of annotationSupport
			if(this.props.ingredients.annotationSupport) {
				annotationBox = (
					<AnnotationBox
						showModal={this.state.showAnnotationModal} //show the modal yes/no
						hideAnnotationForm={this.hideAnnotationForm.bind(this)} //pass along the function to hide the modal

						activeAnnotation={this.state.activeAnnotation} //the active annotation

						annotationModes={this.props.ingredients.annotationModes} //how each annotation mode/motivation is configured

						onSave={this.onSave.bind(this)} //callback function after saving an annotation
					/>
				);
				annotationList = (
					<AnnotationList
						activeAnnotation={this.state.activeAnnotation} //the active annotation
						annotationTarget={this.state.annotationTarget} //the current annotation target

						showAnnotationForm={this.showAnnotationForm.bind(this)} //when double clicking an item open the form
						setAnnotation={this.setActiveAnnotation.bind(this)} //when clicking an item change the active annotation

						playAnnotation={this.playAnnotation.bind(this)} //enables the list to play stuff (probably not needed later on)
					/>
				);
			}

			//get the unique metadata
			uniqueMetadata = Object.keys(this.state.itemData).map((key, index)=> {
				if(typeof this.state.itemData[key] == 'string' && key[0] != '_') {
					return (
						<tr key={'props__' + index}>
							<td><strong>{key}:</strong></td>
							<td>{this.state.itemData[key]}</td>
						</tr>
					);
				}
			});

			//render the complete metadata block, which includes unique and basic metadata
			metadataPanel = (
				<FlexBox>
					<h3>Metadata</h3>
					<table className="table">
						<tbody>
							<tr>
								<td><strong>id:</strong></td>
								<td>{this.state.itemData._id}</td>
							</tr>
							<tr>
								<td><strong>index:</strong></td>
								<td>{this.state.itemData._index}</td>
							</tr>
							<tr>
								<td><strong>document type:</strong></td>
								<td>{this.state.itemData._type}</td>
							</tr>
							{uniqueMetadata}
						</tbody>
					</table>
				</FlexBox>
			)

			//media objects
			if(this.state.itemData.playableContent) {
				let mediaObjectTypes = [];

				//first generate the tabs
				mediaTabs = this.state.itemData.playableContent.map((mediaObject, index) => {
					let iconClass = null;
					if(mediaObject.mimeType.indexOf('video') != -1) {
						iconClass = 'glyphicon glyphicon-film';
						mediaObjectTypes[index] = 'video';
					} else if(mediaObject.mimeType.indexOf('audio') != -1) {
						iconClass = 'glyphicon glyphicon-equalizer';
						mediaObjectTypes[index] = 'audio';
					} else if(mediaObject.mimeType.indexOf('image') != -1) {
						iconClass = 'glyphicon glyphicon-picture';
						mediaObjectTypes[index] = 'image';
					}
					return (
						<li key={index + '__mt'}
							className={this.state.activeMediaTab == index ? 'active' : ''}>
							<a data-toggle="tab" href={'#__mo' + index}>
								{mediaObjectTypes[index]}&nbsp;{index}&nbsp;<i className={iconClass}></i>
							</a>
						</li>
					)
				}, this)

				//then generate the tab contents
				mediaTabContents = this.state.itemData.playableContent.map((mediaObject, index) => {
					let mediaPlayer = 'Unknown Media Object: ' + index;

					if(mediaObjectTypes[index] == 'video') {//render a video player
						mediaPlayer = (
							<FlexPlayer
								mediaObjectId={'__mo' + index}
								user={this.state.user} //current user
								mediaObject={mediaObject} //TODO make this plural for playlist support

								annotationSupport={this.props.ingredients.annotationSupport} //annotation support the component should provide

								editAnnotation={this.editAnnotation.bind(this)} //each annotation support should call this function
								setActiveAnnotationTarget={this.setActiveAnnotationTarget.bind(this)}//TODO so the component can callback the active mediaObject
							/>
						);
					} else if (mediaObjectTypes[index] == 'audio') { //TODO integrate audio within the flex player
						mediaPlayer = (
							<FlexPlayer
								mediaObjectId={'__mo' + index}
								user={this.state.user} //current user
								mediaObject={mediaObject} //TODO make this plural for playlist support

								annotationSupport={this.props.ingredients.annotationSupport} //annotation support the component should provide

								editAnnotation={this.editAnnotation.bind(this)} //each annotation support should call this function
								setActiveAnnotationTarget={this.setActiveAnnotationTarget.bind(this)}//TODO so the component can callback the active mediaObject
							/>
						);
					} else if (mediaObjectTypes[index] == 'image') { //TODO detect a iiif url and create a cool iiif component
						mediaPlayer = (
							<FlexImageViewer
								mediaObjectId={'__mo' + index}
								mediaObject={mediaObject}//TODO make this plural for playlist support

								annotationSupport={this.props.ingredients.annotationSupport} //annotation support the component should provide

								editAnnotation={this.editAnnotation.bind(this)} //each annotation support should call this function
								setActiveAnnotationTarget={this.setActiveAnnotationTarget.bind(this)}//TODO so the component can callback the active mediaObject
							/>
						);
					}

					return (
						<div key={index + '__mtc'}
							id={'__mo' + index}
							className={this.state.activeMediaTab == index ? 'tab-pane active' : 'tab-pane'}>
							<h3>{mediaObjectTypes[index]}&nbsp;{index}</h3>
							<div className="media-player">
								{mediaPlayer}
							</div>
						</div>
					);
				}, this);

				//finally generate the mediaPanel
				mediaPanel = (
					<FlexBox>
						<h3>Media objects</h3>
						<ul className="nav nav-tabs">
							{mediaTabs}
						</ul>
						<div className="tab-content">
							{mediaTabContents}
						</div>
					</FlexBox>
				);
			}
		}


		return (
			<div>
				<div className="row">
					<div className="col-md-12">
						{annotationList}
						{annotationBox}
						<br/>
					</div>
				</div>
				<div className="row">
					<div className="col-md-12">
						{mediaPanel}
						{metadataPanel}
					</div>
				</div>
			</div>
		)
	}

}

export default ItemDetailsRecipe;