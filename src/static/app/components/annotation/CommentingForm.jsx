import React from 'react';

class CommentingForm extends React.Component {

	constructor(props) {
		super(props);
	}

	handleChangeComment(e) {
		this.props.updateAnnotationData('comment', e.target.value);
	}

	render() {
		return (
			<div key="form__comment" className="row">
				<br/>
				<div className="col-md-12">
					<form>
						<div className="form-group">
							<label htmlFor="comment">Comment</label>
							<input
								ref="comment"
								type="text"
								className="form-control"
								placeholder="Add one or more tags"
								value={this.props.data}
								onChange={this.handleChangeComment.bind(this)}
							/>
						</div>
					</form>
				</div>
			</div>
		)
	}
}

export default CommentingForm;