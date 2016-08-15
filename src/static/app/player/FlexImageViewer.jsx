/*
Currently uses:
	- https://openseadragon.github.io
	- https://github.com/picturae/openseadragonselection

TODO
	- make sure to save the annotations. This requires properly implementing the addAnnotationToTarget functions
*/
class FlexImageViewer extends React.Component {

	constructor(props) {
		super(props);

		this.viewer = null;
		this.annotationIdCount = 0;

		/* annotations are expected to look like this:

				{
					id : 'dummy',
					rect : {
						x : 30,
						y : 75,
						w : 300,
						h : 25
					},
					rotation : 0
				}
		*/

		this.state = {
			//this could be part of a super class
			annotations : this.props.mediaObject.annotations ? this.props.mediaObject.annotations : [],
			currentAnnotation : null
		}
	}

	componentDidMount() {
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
		    returnPixelCoordinates:  true,
		    keyboardShortcut:        'c', // key to toggle selection mode
		    rect:                    null, // initial selection as an OpenSeadragon.SelectionRect object
		    startRotated:            false, // alternative method for drawing the selection; useful for rotated crops
		    startRotatedHeight:      0.1, // only used if startRotated=true; value is relative to image height
		    restrictToImage:         false, // true = do not allow any part of the selection to be outside the image
		    onSelection:             function(rect) {
		    	console.debug(rect)
		    	this.addAnnotation.call(
		    		this,
		    		{
		    			id : null,
		    			rect : {x : rect.x, y: rect.y, w: rect.width, h: rect.height},
		    			rotation : rect.rotation
		    		}
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
			this.state.annotations.forEach((annotation) => {
				this.renderAnnotation(annotation);
			})
		}.bind(this))
	}

	addAnnotation(annotation) {
		let annotations = this.state.annotations;
		annotation.id = '__annotation_' + (this.annotationIdCount++);
		annotations.push(annotation);
		this.renderAnnotation.call(this, annotation);
		this.setState({
			annotations : annotations
		});
	}

	removeAnnotation(annotationId, event) {
		console.debug('removing: ' + annotationId);
		if(event) {
			event.preventDefault();
		}
		let annotations = this.state.annotations;
		let index = -1;
		annotations.forEach((a, i) => {
			console.debug(a);
			if(a.id == annotationId) {
				index = i;
			}
		})
		if(index != -1) {
			this.viewer.removeOverlay(annotationId);
			annotations.splice(index, 1);
			this.setState({
				annotations : annotations
			});
		}
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
		var rect = this.viewer.viewport.imageToViewportRectangle(
            parseInt(annotation.rect.x),
            parseInt(annotation.rect.y),
            parseInt(annotation.rect.w),
            parseInt(annotation.rect.h)
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
        addBtn.onclick = this.handleOverlayClick.bind(this, annotation);
        var addGlyph = document.createElement('span');
        addGlyph.className = 'glyphicon glyphicon-plus';
        addBtn.appendChild(addGlyph);

        //add the remove button
        var removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-primary';
        removeBtn.onclick = this.removeAnnotation.bind(this, annotation.id);
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

	handleOverlayClick(annotation, event) {
		event.preventDefault();
		if(this.props.addAnnotationToTarget) {
			this.props.addAnnotationToTarget(
				this.props.mediaObject.url,
				this.props.mediaObject.mimeType,
				annotation
			);
		}
	}

	render() {
		return (
			<div id={'img_viewer' + this.props.mediaObjectId}></div>
		)
	}

}

export default FlexImageViewer;