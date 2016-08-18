import Annotation from './Annotation';
import AnnotationAPI from '../../api/AnnotationAPI';
import AnnotationUtil from '../../util/AnnotationUtil';

import AnnotationActions from '../../flux/AnnotationActions';
import AppAnnotationStore from '../../flux/AnnotationStore';

class AnnotationList extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			annotations : []
		}
	}

	componentDidMount() {
		//load the initial annotations
		this.loadAnnotations();

		//then listen to any changes that happen in the API
		AppAnnotationStore.bind('change-target', this.loadAnnotations.bind(this));
		AppAnnotationStore.bind('change', this.loadAnnotations.bind(this));
	}

	loadAnnotations() {
		if(this.props.annotationTarget) {
			console.debug('the target changed: ' + this.props.annotationTarget.source);
			AppAnnotationStore.getFiltered(
			   	'target.source',
			   	this.props.annotationTarget.source,
			   	this.onLoadAnnotations.bind(this)
			);
		}
	}

	//this sets the annotations in the state object
	onLoadAnnotations(annotationData) {
		this.setState(annotationData);
	}

	deleteAnnotation(annotation) {
		AnnotationActions.delete(annotation);
	}

	//TODO this function has to know everything about where the annotation target is and be able to
	//redirect the user to it
	playAnnotation(annotation) {
		if(this.props.playAnnotation) {
			this.props.playAnnotation(annotation);
		}
	}

	render() {
		let annotationItems = null;
		if(this.state.annotations) {
			annotationItems = this.state.annotations.map(function(annotation) {
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
		}
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