import React from 'react';
import AnnotationAPI from '../../api/AnnotationAPI.js';

//TODO dependancy on jquery!! fix this later

class AnnotationBox extends React.Component{

	constructor(props) {
		super(props);
		this.state = {
			annotation : null,
			annotations: []
		};
	}

	loadCommentsFromServer() {
		$.ajax({
			url : _config.ANNOTATION_API_BASE + '/annotation',
			type : 'GET',
			success: function(data) {
				this.setState(data);
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	}

	handleSave(annotation) {
		var annotations = this.state.annotations;
		annotations.push(annotation);
		this.setState({annotations : annotations});
	}

	handleDelete(annotationId) {
		AnnotationAPI.deleteAnnotation(annotationId, function(data) {
			var annotations = $.grep(this.state.annotations, function(e){
				return e.annotationId != annotationId;
			});
			this.setState({annotations : annotations});
		}.bind(this));
	}

	componentDidMount() {
		this.loadCommentsFromServer();
	}

	addNewAnnotation() {
		this.setState({'annotation' : null});
		$('#annotation-modal').modal('show');
	}

	render() {
		return (
			<div className="commentBox">
				<h3>Saved annotations</h3>
				<AnnotationList annotations={this.state.annotations} handleDelete={this.handleDelete.bind(this)}/>
				<button type="button" className="btn btn-info" onClick={this.addNewAnnotation.bind(this)}>
					Add annotation
				</button>
				<AnnotationModal annotation={this.state.annotation} handleSave={this.handleSave.bind(this)}/>
			</div>
		);
	}
};

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

class AnnotationList extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		var commentNodes = this.props.annotations.map(function(annotation) {
			return (
				<Annotation
					annotationId={annotation.annotationId}
					key={annotation.annotationId}
					handleDelete={this.props.handleDelete}>
					{annotation.resourceURI}
				</Annotation>
			);
		}, this);
		return (
			<ul className="list-group">
				{commentNodes}
			</ul>
		);
	}
};

class Annotation extends React.Component {

	constructor(props) {
		super(props);
	}

	playAnnotation() {
		console.debug(this.props.annotationId);
	}

	handleDelete() {
		this.props.handleDelete(this.props.annotationId)
	}

	render() {
		return (
			<li className="list-group-item">
				<a className="anchor" onClick={this.playAnnotation.bind(this)}>
					<abbr>{this.props.annotationId}</abbr>
				</a>
				&nbsp;
				<i className="glyphicon glyphicon-remove interactive" onClick={this.handleDelete.bind(this)}></i>
			</li>
		);
	}
};

export default AnnotationBox;