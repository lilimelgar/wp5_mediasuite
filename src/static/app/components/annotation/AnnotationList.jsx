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
					playerAPI={this.props.playerAPI}
					deleteAnnotation={this.props.deleteAnnotation}
				/>
			);
		}, this);
		return (
			<div>
				<h3>Saved annotations</h3>
				<ul className="list-group">
					{commentNodes}
				</ul>
			</div>
		);
	}
};

export default AnnotationList;