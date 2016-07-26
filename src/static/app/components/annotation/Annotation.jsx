import React from 'react';

class Annotation extends React.Component {

	constructor(props) {
		super(props);
	}

	setAnnotation() {
		this.props.setAnnotation(this.props.annotation);
	}

	playAnnotation() {
		this.props.playAnnotation(this.props.annotation);
	}

	editAnnotation() {
		this.props.editAnnotation();
	}

	deleteAnnotation() {
		this.props.deleteAnnotation(this.props.annotation.annotationId);
	}

	computeClass() {
		var className = 'list-group-item';
		if(this.props.activeAnnotation) {
			if(this.props.activeAnnotation.annotationId === this.props.annotation.annotationId) {
				className += ' active';
			}
		}
		return className;
	}

	render() {
		return (
			<li
				className={this.computeClass()}
				onClick={this.setAnnotation.bind(this)}
				onDoubleClick={this.editAnnotation.bind(this)}
			>
				<abbr>{this.props.annotation.data.tags}</abbr>
				&nbsp;
				<i className="glyphicon glyphicon-remove interactive"
					onClick={this.deleteAnnotation.bind(this)}>
				</i>
				<i className="glyphicon glyphicon-play interactive"
					onClick={this.playAnnotation.bind(this)}>
				</i>
			</li>
		);
	}
};

export default Annotation;