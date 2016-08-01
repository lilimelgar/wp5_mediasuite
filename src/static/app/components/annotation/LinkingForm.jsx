class LinkingForm extends React.Component {

	constructor(props) {
		super(props);
		var api = this.props.config.apis ? this.props.config.apis[0].name : null;
		this.state = {
			api : api,
			results : []
		}
	}

	/* ------------------- CRUD / loading of classifications ------------------- */

	setAPI(event) {
		this.setState({api : event.target.value});
	}

	//TODO make sure that at least one common property is present in the linkData (when hooking up different APIs)
	addLink(linkData) {
		var links = this.props.data;
		if(links) {
			links.push(linkData);
			/* this calls the owner function, which will update the state, which
			in turn will update this.props.data with the added classification */
			this.props.updateAnnotationData('links', links);
		}
	}

	removeLink(index) {
		var links = this.props.data;
		if(links) {
			links.splice(index, 1);
			this.props.updateAnnotationData('links', links);
		}
	}

	search(event) {
		event.preventDefault();
		let url = '/link/'+this.state.api+'/search?q=' + this.refs.search.value;
	    d3.json(url, function(error, data) {
	        this.onSearch(data);
	    }.bind(this));
	}

	onSearch(data) {
		this.setState({results : data});
	}

	render() {
		const links = this.props.data.map((link, index) => {
			return (
				<li key={'com__' + index} className="list-group-item">
					<i className="glyphicon glyphicon-remove interactive" onClick={this.removeLink.bind(this, index)}></i>
					&nbsp;
					{link.label}
				</li>
			)
		}, this);


		//generate the options from the config and add a default one
		const apiOptions = this.props.config.apis.map((api, index) => {
			return (
				<label className="radio-inline" key={index}>
					<input
						type="radio"
						name="apiOptions"
						id={api.name}
						value={api.name}
						checked={api.name == this.state.api}
						onChange={this.setAPI.bind(this)}/>
						{api.name}
				</label>
			);
		}, this);

		const results = this.state.results.map((res, index) => {
			return(
				<div key={'result__' + index} className="media-body interactive" onDoubleClick={this.addLink.bind(this, res)}>
					<h4 className="media-heading">{res.label}</h4>
					{res.description}
				</div>
			)
		}, this)

		return (
			<div key={'form__link'}>
				<br/>
				<div className="row">
					<div className="col-md-12">
						<h4>Added links</h4>
						<ul className="list-group">
							{links}
						</ul>
					</div>
				</div>
				<div className="row">
					<div className="col-md-12">
						<form>
							<div className="form-group">
								<h4>Add links</h4>
								<br/>
								<div className="text-left">
									<label>API:&nbsp;</label>
									{apiOptions}
								</div>
								<br/>
								<input type="text" ref="search" className="form-control"/>
							</div>

							<button className="btn btn-primary" onClick={this.search.bind(this)}>Search</button>
						</form>

						{this.state.results.length > 0 ?
							<div>
								<h4>Gevonden resultaten <small>Dubbelklik een gevonden resultaat om deze toe te voegen</small></h4>
								<div className="well">
									<div className="media">
										{results}
									</div>
								</div>
							</div>: null}
					</div>
				</div>
			</div>
		);
	}

}

export default LinkingForm;