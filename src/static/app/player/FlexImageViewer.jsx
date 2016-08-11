//TODO convert all program guides of a certain broadcaster to ptif and create a new index
//TODO extend the viewer so it is possible to select a hotspot on an image to annotate it

//See https://openseadragon.github.io/#plugins
//Try: https://github.com/picturae/openseadragonselection
class FlexImageViewer extends React.Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		var viewer = OpenSeadragon({
			id: 'img_viewer' + this.props.mediaObjectId,
			prefixUrl: '/static/node_modules/openseadragon/build/openseadragon/images/',
			//degrees : 0,
			sequenceMode : false,
			preserveViewport: true,

			//in case of a simple image
			tileSources: {
				type: 'image',
				url: this.props.mediaObject.url
				// ,
				// overlays: [{
				// 	id: 'example-overlay',
				// 	x: 0.33,
				// 	y: 0.75,
				// 	width: 0.2,
				// 	height: 0.25,
				// 	className: 'image-overlay'
				// }]
			},
		});
		//TODO make sure to fetch the annotations of this mediaobkect
		//TODO add functionality to draw overlays
		viewer.addHandler('open', function(target, info){
	        console.debug('opened');
	        // var r = viewer.viewport.imageToViewportRectangle(
	        //     0.33,
	        //     0.75,
	        //     0.2,
	        //     0.25
	        // );
	        var elt = document.createElement("div");
	        elt.className = "image-overlay";
	        elt.onclick = this.handleOverlayClick.bind(this);
	        viewer.addOverlay({
	        	element: elt,
            	location: new OpenSeadragon.Rect(0.33, 0.75, 0.2, 0.25)
	        });
	    }.bind(this));
	}

	handleOverlayClick(event) {
		event.preventDefault();
		this.props.addAnnotationToTarget(this.props.mediaObject.url, -1, -1);
	}

	render() {
		return (
			<div id={'img_viewer' + this.props.mediaObjectId}></div>
		)
	}

}

export default FlexImageViewer;