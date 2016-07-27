import React from 'react';

//TODO this components needs to be able to load an annotation form based on a config

class AnnotationCreator extends React.Component {

	constructor(props) {
		super(props);
	}

	gatherDataAndSave() {
		console.debug('Saving this annotation...');
		console.debug(this.props.annotation);
		var annotation = this.props.annotation;
		if(!annotation) {
			annotation = {};
		}
		annotation.data = {
			tags : $('#annotation-tags').val()
		}
		this.props.saveAnnotation(annotation);
	}

	render() {
		return (
			<div>
				<form>
					<div className="form-group">
						<label htmlFor="annotation-tags">Tags</label>
						<input id="annotation-tags" type="text" className="form-control" placeholder="Add one or more tags"/>
					</div>
					<button
						type="button"
						className="btn btn-default"
						onClick={this.gatherDataAndSave.bind(this)}>
						Save
					</button>
				</form>
			</div>
		)
	}
}

export default AnnotationCreator;