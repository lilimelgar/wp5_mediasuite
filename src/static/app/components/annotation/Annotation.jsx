import React from 'react';
import TimeUtil from '../../util/TimeUtil';

class Annotation extends React.Component {

	constructor(props) {
		super(props);
	}

	setAnnotation() {
		this.props.setAnnotation(this.props.annotation);
	}

	playAnnotation() {
		this.props.playerAPI.setActiveSegment({
			start : this.props.annotation.start, end : this.props.annotation.end
		}, true, true);
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
				<abbr>
					{TimeUtil.formatTime(this.props.annotation.start)}&nbsp;-&nbsp;
					{TimeUtil.formatTime(this.props.annotation.end)}&nbsp;
					(door: {this.props.annotation.user})
				</abbr>
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