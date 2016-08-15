import React from 'react';

import TimeUtil from './util/TimeUtil';

import FlexBox from './components/FlexBox';
import FlexPlayer from './player/FlexPlayer';
import FlexImageViewer from './player/FlexImageViewer';

import SearchAPI from './api/searchAPI';

import AnnotationAPI from './api/AnnotationAPI';
import AnnotationUtil from './util/AnnotationUtil'
import AnnotationBox from './components/annotation/AnnotationBox';
import AnnotationList from './components/annotation/AnnotationList';

import CollectionUtil from './util/CollectionUtil';
import CollectionDataUtil from './util/CollectionDataUtil';

//TODO this can later be integrated into Recipe.jsx. It's no longer necessary to have different types of recipes
class ItemDetailsRecipe extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			user : 'JaapTest',
			activeAnnotation: null,
			showAnnotationModal : false,
			annotationTarget : null,
			itemData : null,
			activeMediaTab : -1
		}
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

	onLoadItemData(collectionId, itemId, data) {
		var config = CollectionUtil.determineConfig(collectionId);
		data = CollectionDataUtil.formatSearchResult(data);//first format the data to component compatible objects
		data = config.getItemDetailData(data);//then format/amend this data further with collection config intelligence
		this.setState({itemData : data});
	}

	/* ------------------------------------------------------------------------------
	------------------------------- VIDEO RELATED FUNCTIONS -------------------------
	------------------------------------------------------------------------------- */

	//TODO this should also receive information on the mediaObject, so it can be mapped
	onPlayerReady(playerAPI, mediaObject) {
		console.debug('player api for ' + mediaObject + ' is available')
		//this.setState({playerAPI : playerAPI});
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

						user={this.state.user} //current user
						activeAnnotation={this.state.activeAnnotation} //the active annotation
						annotationTarget={this.state.annotationTarget} //the current annotation target

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

						playerAPI={this.state.playerAPI} //enables the list to play stuff (probably not needed later on)
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
								mediaObject={mediaObject} //currently visible media object

								annotationSupport={this.props.ingredients.annotationSupport} //annotation support the component should provide
								annotationModes={this.props.ingredients.annotationModes} //config for each supported annotation feature
								addAnnotationToTarget={this.addAnnotationToTarget.bind(this)} //each annotation support should call this function

								onPlayerReady={this.onPlayerReady.bind(this)} //returns the playerAPI when the player is ready
							/>
						);
					} else if (mediaObjectTypes[index] == 'audio') { //TODO integrate audio within the flex player
						mediaPlayer = (
							<FlexPlayer
								mediaObjectId={'__mo' + index}
								user={this.state.user} //current user
								mediaObject={mediaObject} //currently visible media object

								annotationSupport={this.props.ingredients.annotationSupport} //annotation support the component should provide
								annotationModes={this.props.ingredients.annotationModes} //config for each supported annotation feature
								addAnnotationToTarget={this.addAnnotationToTarget.bind(this)} //each annotation support should call this function

								onPlayerReady={this.onPlayerReady.bind(this)} //returns the playerAPI when the player is ready
							/>
						);
					} else if (mediaObjectTypes[index] == 'image') { //TODO detect a iiif url and create a cool iiif component
						mediaPlayer = (
							<FlexImageViewer
								mediaObjectId={'__mo' + index}
								mediaObject={mediaObject}

								annotationSupport={this.props.ingredients.annotationSupport} //annotation support the component should provide
								annotationModes={this.props.ingredients.annotationModes} //config for each supported annotation feature
								addAnnotationToTarget={this.addAnnotationToTarget.bind(this)} //each annotation support should call this function
							/>
						);
						// mediaPlayer = (
						// 	<a href={mediaObject.url}
						// 		target="__external">
						// 		<img src={mediaObject.url}/>
						// 	</a>
						// );
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
					<div className={this.props.ingredients.annotationSupport ? 'col-md-9' : 'col-md-12'}>
						{mediaPanel}
						{metadataPanel}
					</div>
					<div className={this.props.ingredients.annotationSupport ? 'col-md-3' : null}>
						{annotationList}
						{annotationBox}
					</div>
				</div>
			</div>
		)
	}

}

export default ItemDetailsRecipe;