import React from 'react';

class CommentingForm extends React.Component {

	constructor(props) {
		super(props);
	}

	addComment(e) {
		e.preventDefault();
		var cs = this.props.data;
		if(cs) {
			cs.push(this.refs.comment.value);
			this.props.updateAnnotationData('comments', cs);
			this.refs.comment.value = '';
		}
	}

	removeComment(index) {
		var cs = this.props.data;
		if(cs) {
			cs.splice(index, 1);
			this.props.updateAnnotationData('comments', cs);
		}
	}

	render() {
		const comments = this.props.data.map((c, index) => {
			return (
				<li key={'com__' + index} className="list-group-item">
					<i className="glyphicon glyphicon-remove interactive" onClick={this.removeComment.bind(this, index)}></i>
					&nbsp;
					{c}
				</li>
			)
		}, this);
		return (
			<div key="form__comment">
				<br/>
				<div className="row">
					<div className="col-md-12">
						<h4>Added comments</h4>
						<ul className="list-group">
							{comments}
						</ul>
					</div>
				</div>
				<div className="row">
					<div className="col-md-12">
						<form>
							<div className="form-group">
								<h4>Comment</h4>
								<input
									ref="comment"
									type="text"
									className="form-control"
									placeholder="Add one or more tags"
								/>
								<br/>
								<button className="btn btn-primary" onClick={this.addComment.bind(this)}>Add</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		)
	}
}

export default CommentingForm;