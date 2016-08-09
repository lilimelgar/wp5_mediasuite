import Annotation from './Annotation';
import AnnotationAPI from '../../api/AnnotationAPI';
import AnnotationUtil from '../../util/AnnotationUtil';

//TODO zo maken dat dit component zelfstandig de annotaties ophaalt en
//hierbij per default alleen de annotaties van de huidige user en het huidige annotatie target laat zien

class AnnotationList extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			annotations : []
		}
	}

	componentDidMount() {
		this.loadAnnotations();
		setInterval(this.loadAnnotations.bind(this), 1500);
	}

	loadAnnotations() {
		console.debug('loading annotations');
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
		if(annotation.target.source == this.state.annotationTarget.source) {
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

	render() {
		const annotations = this.state.annotations.map(function(annotation) {
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
					{annotations}
				</ul>
			</div>
		);
	}
};

export default AnnotationList;