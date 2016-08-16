import Annotation from './Annotation';
import AnnotationAPI from '../../api/AnnotationAPI';
import AnnotationUtil from '../../util/AnnotationUtil';

class AnnotationList extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			annotations : []
		}
	}

	componentDidMount() {
		this.loadAnnotations();
		this.loadInterval = setInterval(this.loadAnnotations.bind(this), 1500);
	}

	componentWillUnmount() {
		clearInterval(this.loadInterval);
		console.debug('The interval is now: ');
		console.debug(this.loadInterval);
	}

	loadAnnotations() {
		AnnotationAPI.getAnnotations(function(data) {
			this.onLoadAnnotations(data);
		}.bind(this));
	}

	//this sets the annotations in the state object
	onLoadAnnotations(annotationData) {
		this.setState(annotationData);
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

	//TODO this function has to know everything about where the annotation target is and be able to
	//redirect the user to it
	playAnnotation(annotation) {
		if(this.props.annotationTarget) {
			//TODO make sure to check the mimeType and also add support for images/spatial targets!!
			if(annotation.target.source == this.props.annotationTarget.source) {
				let interval = AnnotationUtil.extractTemporalFragmentFromURI(annotation.target.selector);
				if(interval) {
					this.props.playerAPI.setActiveSegment({
						start : interval[0], end : interval[1]
					}, true, true);
				} else {
					this.props.playerAPI.setActiveSegment(null, true, true);
				}
			} else {
				console.debug('Currently a completely different annotation target is loaded');
			}
		} else {
			console.debug('Currently there is no annotation target defined!');
		}
	}

	render() {
		//TODO do this in the API rather than on the client side!!! (this is just to test)
		let annotations = this.state.annotations.filter((a) => {
			if(this.props.annotationTarget && a.target.source == this.props.annotationTarget.source) {
				return a;
			}
		}, this);
		//TODO filter the annotations here based on the annotationTarget
		const annotationItems = annotations.map(function(annotation) {
			let active = false;
			if(this.props.activeAnnotation) {
				active = this.props.activeAnnotation.id === annotation.id
			}
			return (
				<Annotation
					key={annotation.id}
					annotation={annotation}

					active={active}

					showAnnotationForm={this.props.showAnnotationForm}
					setAnnotation={this.props.setAnnotation}

					deleteAnnotation={this.deleteAnnotation.bind(this)}
					playAnnotation={this.playAnnotation.bind(this)}
				/>
			);
		}, this);
		return (
			<div>
				<h3>Saved annotations</h3>
				<ul className="list-group">
					{annotationItems}
				</ul>
			</div>
		);
	}
};

export default AnnotationList;