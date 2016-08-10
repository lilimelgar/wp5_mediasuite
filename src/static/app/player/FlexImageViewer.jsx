class FlexImageViewer extends React.Component {

	constructor(props) {
		super(props)
	}

	componentDidMount() {
		OpenSeadragon({
			id: 'img_viewer' + this.props.mediaObjectId,
			prefixUrl: '/static/node_modules/openseadragon/build/openseadragon/images/',
        	//degrees : 0,
        	sequenceMode : false,
        	preserveViewport: true,

        	//in case of a simple image
		    tileSources: {
		        type: 'image',
		        url: this.props.mediaObject.url
		    }
		});
	}

	render() {
		return (
			<div id={'img_viewer' + this.props.mediaObjectId}></div>
		)
	}

}

export default FlexImageViewer;