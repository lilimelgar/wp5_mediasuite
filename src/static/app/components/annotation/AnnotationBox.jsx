import React from 'react';
import AnnotationAPI from '../../api/AnnotationAPI.js';
import AnnotationCreator from './AnnotationCreator.jsx';
import AnnotationList from './AnnotationList.jsx';
import FlexModal from '../FlexModal.jsx';

//TODO dependancy on jquery!! fix this later
//TODO make sure the editing form can be shown in a div rather than a pop-up. This is important, because modals
//prevent you from watching the video while annotating

class AnnotationBox extends React.Component {

	constructor(props) {
		super(props);
		console.debug('render this thing');
		this.state = {
			annotation : null,
			annotations: [],
			showModal : this.props.showModal == null ? false : this.props.showModal,
			showList : this.props.showList != null ? this.props.showList : true
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

	// addAnnotation() {
	// 	this.setState({
	// 		annotation : null
	// 	}, this.props.handleShowModal())
	// }

	setAnnotation(annotation) {
		this.setState({
			annotation : annotation
		})
	}

	saveAnnotation(annotation) {
		AnnotationAPI.saveAnnotation(this.props.annotationTarget, annotation, function(data) {
			this.onSave(data);
		}.bind(this));
	}

	onSave(annotation) {
		var annotations = $.grep(this.state.annotations, function(e){
			return e.annotationId != annotation.annotationId;
		});
		annotations.push(annotation);
		$('#annotation__modal').modal('hide');//TODO ugly, but without this the static backdrop won't disappear!
		this.props.handleHideModal();
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

	render() {
		return (
			<div className="commentBox">
				{this.state.showList ? <AnnotationList
					activeAnnotation={this.state.annotation}
					annotations={this.state.annotations}
					setAnnotation={this.setAnnotation.bind(this)}
					playerAPI={this.props.playerAPI}
					editAnnotation={this.props.handleShowModal.bind(this)}
					deleteAnnotation={this.deleteAnnotation.bind(this)}/> : null}

				{this.props.showModal ?
					<FlexModal
						elementId="annotation__modal"
						handleHideModal={this.props.handleHideModal.bind(this)}
						title={'Add annotation to: ' + this.props.annotationTarget}>
						<AnnotationCreator
							annotation={this.state.annotation}
							saveAnnotation={this.saveAnnotation.bind(this)}
							annotationModes={this.props.annotationModes}
							playerAPI={this.props.playerAPI}
							user={this.props.user}
						/>
					</FlexModal>: null
				}
			</div>
		);
	}
};

export default AnnotationBox;