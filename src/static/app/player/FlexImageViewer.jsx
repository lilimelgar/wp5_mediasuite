/*
Currently uses:
	- https://openseadragon.github.io
	- https://github.com/picturae/openseadragonselection
*/

import AnnotationAPI from '../api/AnnotationAPI';
import AnnotationUtil from '../util/AnnotationUtil';

import AnnotationActions from '../flux/AnnotationActions';
import AppAnnotationStore from '../flux/AnnotationStore';

//TODO dit ding moet ook reageren op externe deletes en saves (de Flexplayer ook)

class FlexImageViewer extends React.Component {

	constructor(props) {
		super(props);

		this.viewer = null;
		this.annotationIdCount = 0;//TODO do this differently later on
		this.state = {
			//this could be part of a super class
			annotations : [],
			viewerLoaded : false
		}
	}

	/* --------------------------------------------------------------
	-------------------------- OBSERVING THE API --------------------
	---------------------------------------------------------------*/

	componentDidMount() {
		//load the initial annotations
		this.loadAnnotations();

		//then listen to any changes that happen in the API
		AppAnnotationStore.bind(this.props.mediaObject.url, this.onChange.bind(this));
	}

	onChange() {
		console.debug('the list changed!');
		this.loadAnnotations();
	}

	loadAnnotations() {
		AppAnnotationStore.getFiltered('target.source', this.props.mediaObject.url, this.onLoadAnnotations.bind(this));
	}

	onLoadAnnotations(annotationData) {
		if(!this.state.viewerLoaded) {
			this.setState((previousState, currentProps) => {
  				return {annotations : this.deleteOldOverlays.call(this, previousState.annotations, annotationData.annotations)};
			}, this.initViewer.bind(this));

			//this.setState(annotationData, this.initViewer.bind(this));
		} else {
			this.setState((previousState, currentProps) => {
  				return {annotations : this.deleteOldOverlays.call(this, previousState.annotations, annotationData.annotations)};
			});
		}
	}

	deleteAnnotation(annotation, event) {
		if(event) {
			event.preventDefault();
			event.stopPropagation();
		}
		if(annotation && annotation.id) {
			AnnotationActions.delete(annotation, this.onDelete.bind(this));
		}
	}

	onDelete(data, annotationId) {
		this.viewer.removeOverlay(annotationId);
	}

	annotationExists(annotationId) {
		var annotations = this.state.annotations;
		for(let i=0;i<annotations.length;i++) {
			if(annotations[i].id == annotationId) {
				return true;
			}
		}
		return false;
	}

	/* --------------------------------------------------------------
	-------------------------- VIEWER INITIALIZATION ----------------
	---------------------------------------------------------------*/

	initViewer() {
		this.viewer = OpenSeadragon({
			id: 'img_viewer' + this.props.mediaObjectId,
			prefixUrl: '/static/node_modules/openseadragon/build/openseadragon/images/',
			showSelectionControl:    true,
			sequenceMode : false,
			preserveViewport: true,

			//in case of a simple image
			tileSources: {
				type: 'image',
				url: this.props.mediaObject.url
			},
		});

		//for the picturae selection stuff
		this.viewer.selection({
			showConfirmDenyButtons: true,
			styleConfirmDenyButtons: true,
			returnPixelCoordinates: true,
			keyboardShortcut: 'c', // key to toggle selection mode
			rect: null, // initial selection as an OpenSeadragon.SelectionRect object
			startRotated: false, // alternative method for drawing the selection; useful for rotated crops
			startRotatedHeight: 0.1, // only used if startRotated=true; value is relative to image height
			restrictToImage: false, // true = do not allow any part of the selection to be outside the image
			onSelection: function(rect) {
				this.addEmptyAnnotation.call(
					this,
					AnnotationUtil.generateW3CEmptyAnnotation(
						this.props.user,
						this.props.mediaObject.url,
						this.props.mediaObject.mimeType,
						{
							rect : {
								x : rect.x,
								y : rect.y,
								w : rect.width,
								h : rect.height
							},
							rotation : rect.rotation
						}
					)
				);
			}.bind(this), // callback
			prefixUrl: '/static/vendor/openseadragonselection-master/images/',
			navImages:               { // overwrites OpenSeadragon's options
				selection: {
					REST:   'selection_rest.png',
					GROUP:  'selection_grouphover.png',
					HOVER:  'selection_hover.png',
					DOWN:   'selection_pressed.png'
				},
				selectionConfirm: {
					REST:   'selection_confirm_rest.png',
					GROUP:  'selection_confirm_grouphover.png',
					HOVER:  'selection_confirm_hover.png',
					DOWN:   'selection_confirm_pressed.png'
				},
				selectionCancel: {
					REST:   'selection_cancel_rest.png',
					GROUP:  'selection_cancel_grouphover.png',
					HOVER:  'selection_cancel_hover.png',
					DOWN:   'selection_cancel_pressed.png'
				},
			}
		});

		this.viewer.addHandler('open', function(target, info) {
			this.renderAll.bind(this);
			this.setState({viewerLoaded : true});
		}.bind(this))


	}

	/* --------------------------------------------------------------
	-------------------------- ANNOTATION CRUD ----------------------
	---------------------------------------------------------------*/

	renderAll() {
		this.state.annotations.forEach((annotation) => {
			if(!this.viewer.getOverlayById(annotation.id)) {
				this.renderAnnotation(annotation);
			}
		});
	}

	deleteOldOverlays(oldAnnotations, newAnnotations) {
		oldAnnotations.forEach((annotation) => {
			console.debug('removing overlay: ' + annotation.id);
			this.viewer.removeOverlay(annotation.id);
		});
		return newAnnotations;
	}

	addEmptyAnnotation(annotation) {
		let annotations = this.state.annotations;
		annotation.id = AnnotationUtil.guid();
		console.debug('new ID: ' + annotation.id);
		annotations.push(annotation);
		this.setState({
			annotations : annotations
		}, this.openAnnotationForm.bind(this, annotation));
	}

	setActiveAnnotation(annotationId, event) {
		var d = document.getElementById(annotationId);
		var overlays = document.getElementsByClassName('image-overlay');
		if(overlays) {
			[].forEach.call(overlays, (elm) => {
				elm.className = 'image-overlay';
			});
			if(d && d.className.indexOf('image-overlay') != -1 && d.className.indexOf('active') == -1) {
				d.className += " active";
			}
		}
	}

	renderAnnotation(annotation) {
		let area = AnnotationUtil.extractSpatialFragmentFromURI(annotation.target.selector.value);
		var rect = this.viewer.viewport.imageToViewportRectangle(
			parseInt(area.x),
			parseInt(area.y),
			parseInt(area.w),
			parseInt(area.h)
		);
		var elt = document.createElement('div');
		elt.className = 'image-overlay';
		elt.onclick= this.setActiveAnnotation.bind(this, annotation.id);
		elt.id = annotation.id;

		var buttonDiv = document.createElement('div');
		buttonDiv.className = 'text-right';

		//add the remove button
		var addBtn = document.createElement('button');
		addBtn.className = 'btn btn-primary';
		addBtn.onclick = this.openAnnotationForm.bind(this, annotation);
		var addGlyph = document.createElement('span');
		addGlyph.className = 'glyphicon glyphicon-plus';
		addBtn.appendChild(addGlyph);

		//add the remove button
		var removeBtn = document.createElement('button');
		removeBtn.className = 'btn btn-primary';
		removeBtn.onclick = this.deleteAnnotation.bind(this, annotation);
		var removeGlyph = document.createElement('span');
		removeGlyph.className = 'glyphicon glyphicon-remove';
		removeBtn.appendChild(removeGlyph);

		buttonDiv.appendChild(addBtn);
		buttonDiv.appendChild(removeBtn);

		elt.appendChild(buttonDiv);

		this.viewer.addOverlay({
			element: elt,
			location: rect
		});

	}

	openAnnotationForm(annotation, event) {
		if(event) {
			event.preventDefault();
			event.stopPropagation();
		}
		if(this.props.editAnnotation) {
			this.props.editAnnotation(annotation);
		}
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

	//TODO this should 'play' props.playingAnnotation
	playAnnotation(annotation) {
		console.debug('to be implemented: playAnnotation()');
	}

	render() {
		if(this.state.viewerLoaded) {
			this.renderAll();
		}
		return (
			<div id={'img_viewer' + this.props.mediaObjectId}></div>
		)
	}

}

export default FlexImageViewer;