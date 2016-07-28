class ClassifyingForm extends React.Component {

	constructor(props) {
		super(props);
	}

	addClassification(e) {
		e.preventDefault();
		var cs = this.props.data;
		cs.push(this.refs.classifications.value);
		this.refs.classifications.value = '';
		this.props.updateAnnotationData('classifications', cs);
	}

	render() {
		let classifications = this.props.data.map((c, index) => {
			return (<span key={'cl__' + index}><span className="label label-success">{c}</span>&nbsp;</span>)
		});
		return (
			<div key={'form__classify'} className="row">
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

}

export default ClassifyingForm;