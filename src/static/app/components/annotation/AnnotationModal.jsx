import React from 'react';
import AnnotationAPI from '../../api/AnnotationAPI.js';

class AnnotationModal extends React.Component {

	constructor(props) {
		super(props);
	}

	saveAnnotation() {
		var annotationId = null;
		if(this.props.annotation) {
			annotationId = this.props.annotation.annotationId;
		}
		AnnotationAPI.saveAnnotation(annotationId, $('#annotation-tags').val(), function(data) {
			this.props.handleSave(data);
		}.bind(this));
	}

	render() {
		return (<div id="annotation-modal" className="modal fade" role="dialog">
			<div className="modal-dialog">
				<div className="modal-content">
					<div className="modal-header">
						<button type="button" className="close" data-dismiss="modal">&times;</button>
						<h4 className="modal-title">Video annotator</h4>
					</div>
					<div className="modal-body">
						<form>
							<div className="form-group">
								<label htmlFor="annotation-tags">Tags</label>
								<input id="annotation-tags" type="text" className="form-control" placeholder="Add one or more tags"/>
							</div>
						</form>
		      		</div>
		      		<div className="modal-footer">
						<button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
						<button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.saveAnnotation.bind(this)}>
							Save
						</button>
					</div>
				</div>
			</div>
		</div>);
	}
};

export default AnnotationModal;