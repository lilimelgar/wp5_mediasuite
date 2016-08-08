import React from 'react';
import TimeUtil from '../../util/TimeUtil';

class Annotation extends React.Component {

	constructor(props) {
		super(props);
	}

	setAnnotation() {
		if(this.props.setAnnotation) {
			this.props.setAnnotation(this.props.annotation);
		}
	}

	playAnnotation() {
		if(this.props.playAnnotation) {
			this.props.playAnnotation(this.props.annotation);
		}
	}

	deleteAnnotation() {
		if(this.props.deleteAnnotation) {
			this.props.deleteAnnotation(this.props.annotation.annotationId);
		}
	}

	showAnnotationForm() {
		if(this.props.showAnnotationForm) {
			this.props.showAnnotationForm();
		}
	}

	computeClass() {
		var className = 'list-group-item';
		if(this.props.active) {
			className += ' active';
		}
		return className;
	}

	render() {
		return (
			<li
				className={this.computeClass()}
				onClick={this.setAnnotation.bind(this)}
				onDoubleClick={this.showAnnotationForm.bind(this)}
				title={this.props.annotation.annotationId}
			>
				<i className="glyphicon glyphicon-remove interactive"
					onClick={this.deleteAnnotation.bind(this)}>
				</i>
				&nbsp;
				<abbr>
					{TimeUtil.formatTime(this.props.annotation.start)}&nbsp;-&nbsp;
					{TimeUtil.formatTime(this.props.annotation.end)}&nbsp;
					(door: {this.props.annotation.user})
				</abbr>
				&nbsp;
				<i className="glyphicon glyphicon-play interactive"
					onClick={this.playAnnotation.bind(this)}>
				</i>
			</li>
		);
	}
};

export default Annotation;