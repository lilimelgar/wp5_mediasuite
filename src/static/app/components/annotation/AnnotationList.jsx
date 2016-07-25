import React from 'react';
import Annotation from './Annotation.jsx';

class AnnotationList extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		var commentNodes = this.props.annotations.map(function(annotation) {
			return (
				<Annotation
					key={annotation.annotationId}
					activeAnnotation={this.props.activeAnnotation}
					annotation={annotation}
					editAnnotation={this.props.editAnnotation}
					setAnnotation={this.props.setAnnotation}
					playAnnotation={this.props.playAnnotation}
					deleteAnnotation={this.props.deleteAnnotation}
				/>
			);
		}, this);
		return (
			<ul className="list-group">
				{commentNodes}
			</ul>
		);
	}
};

export default AnnotationList;