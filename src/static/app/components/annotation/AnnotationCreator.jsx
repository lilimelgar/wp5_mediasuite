import React from 'react';

//TODO this components needs to be able to load an annotation form based on a config

//Now this creator can be passed a number of desired annotationModes, namely classify or comment.
//Basically this reflects: "should the user be able to classify the resource or comment or both or..."
//TODO see if this idea makes enough sense to expand on

class AnnotationCreator extends React.Component {

	constructor(props) {
		super(props);
		//make this less shitty verbosey
		let comment = '';
		let classifications = [];
		if(this.props.annotation) {
			if(this.props.annotation.data.classifications) {
				classifications = this.props.annotation.data.classifications;
			}
			if(this.props.annotation.data.comment) {
				comment = this.props.annotation.data.comment;
			}
		}
		this.state = {
			modes : this.props.annotationModes,
			classifications : classifications,
			comment : comment
		}
	}

	gatherDataAndSave() {
		console.debug('Saving this annotation...');
		console.debug(this.props.annotation);
		var annotation = this.props.annotation;
		if(!annotation) {
			annotation = {};
		}
		var data = {};
		if(this.state.classifications.length > 0) {
			data['classifications'] = this.state.classifications;
		}
		if(this.state.comment) {
			data['comment'] = this.state.comment
		}
		annotation.data = data;
		this.props.saveAnnotation(annotation);
	}

	//TODO use a config to further configure specific types of forms
	getForms() {
		return this.state.modes.map((mode, index) => {
			if(mode == 'comment') {
				return this.getCommentForm(index);
			} else if(mode == 'classify') {
				return this.getClassifyForm(index);
			} else {
				return ''
			}
		});
	}

	handleChangeComment(e) {
		this.setState({comment : e.target.value});
	}

	getCommentForm(elementIndex) {
		return (
			<div key={'form__' + elementIndex} className="row">
				<div className="col-md-12">
					<form>
						<div className="form-group">
							<label htmlFor="comment">Comment</label>
							<input
								ref="comment"
								type="text"
								className="form-control"
								placeholder="Add one or more tags"
								value={this.state.comment}
								onChange={this.handleChangeComment.bind(this)}
							/>
						</div>
					</form>
				</div>
			</div>
		);
	}

	getClassifyForm(elementIndex) {
		let classifications = this.state.classifications.map((c, index) => {
			return (<span key={'cl__' + index}><span className="label label-success">{c}</span>&nbsp;</span>)
		});
		return (
			<div key={'form__' + elementIndex} className="row">
				<div className="col-md-12">
					<form>
						<div className="form-group">
							<label htmlFor="classifications">Classification</label>
							<input ref="classifications" type="text" className="form-control" placeholder="Add one or more tags"/>
						</div>
						<button className="btn btn-primary" onClick={this.addClassification.bind(this)}>Add</button>
						<br/>
						<br/>
						<div className="well">
							{classifications}
						</div>
					</form>
				</div>
			</div>
		);
	}

	addClassification(e) {
		e.preventDefault();
		var cs = this.state.classifications;
		cs.push(this.refs.classifications.value);
		this.refs.classifications.value = '';
		this.setState({classifications : cs});
	}

	render() {
		const forms = this.getForms();
		return (
			<div>
				{forms}
				<div className="text-right">
					<button
						type="button"
						className="btn btn-primary"
						onClick={this.gatherDataAndSave.bind(this)}>
						Save
					</button>
				</div>
			</div>
		)
	}
}

export default AnnotationCreator;