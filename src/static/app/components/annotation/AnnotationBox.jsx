import React from 'react';
import AnnotationAPI from '../../api/AnnotationAPI.js';
import AnnotationCreator from './AnnotationCreator.jsx';
import AnnotationList from './AnnotationList.jsx';
import FlexModal from '../FlexModal.jsx';

//TODO dependancy on jquery!! fix this later

class AnnotationBox extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			annotation : null,
			annotations: [],
			showModal : false
		};
	}

	loadAnnotationsFromServer() {
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

	addAnnotation() {
		this.setState({
			annotation : null
		}, this.handleShowModal.bind(this))
	}

	setAnnotation(annotation) {
		this.setState({
			annotation : annotation
		})
	}

	//TODO neatly tie in with the player via an access object
	//TODO also make sure the timebar is updated with the in and out points
	playAnnotation(annotation) {
		this.props.seek(annotation.start);
	}

	saveAnnotation(annotation) {
		AnnotationAPI.saveAnnotation(annotation, this.props.start, this.props.end, function(data) {
			this.onSave(data);
		}.bind(this));
	}

	onSave(annotation) {
		var annotations = $.grep(this.state.annotations, function(e){
			return e.annotationId != annotation.annotationId;
		});
		annotations.push(annotation);
		$('#annotation__modal').modal('hide');
		this.setState({annotations : annotations});
	}

	deleteAnnotation(annotationId) {
		AnnotationAPI.deleteAnnotation(annotationId, function(data) {
			this.onDelete(annotationId);
		}.bind(this));
	}

	onDelete(annotationId) {
		var annotations = $.grep(this.state.annotations, function(e){
			return e.annotationId != annotationId;
		});
		this.setState({annotations : annotations});
	}

	componentDidMount() {
		this.loadAnnotationsFromServer();
	}

	handleShowModal() {
		this.setState({showModal: true})
	}

	handleHideModal() {
		this.setState({showModal: false})
	}

	//TODO rewrite with flexmodal
	//TODO pass along the save & delete functions
	render() {
		return (
			<div className="commentBox">
				<h3>Saved annotations</h3>
				<AnnotationList
					activeAnnotation={this.state.annotation}
					annotations={this.state.annotations}
					setAnnotation={this.setAnnotation.bind(this)}
					playAnnotation={this.playAnnotation.bind(this)}
					editAnnotation={this.handleShowModal.bind(this)}
					deleteAnnotation={this.deleteAnnotation.bind(this)}/>
				<button type="button" className="btn btn-info" onClick={this.addAnnotation.bind(this)}>
					Add annotation
				</button>

				{this.state.showModal ?
					<FlexModal
						elementId="annotation__modal"
						handleHideModal={this.handleHideModal.bind(this)}
						title="Add annotation">
						<AnnotationCreator
							annotation={this.state.annotation}
							saveAnnotation={this.saveAnnotation.bind(this)}
							annotationModes={this.props.annotationModes}
						/>
					</FlexModal>: null
				}
			</div>
		);
	}
};

export default AnnotationBox;