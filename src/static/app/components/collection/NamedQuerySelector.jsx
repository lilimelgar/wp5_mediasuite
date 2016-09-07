import CollectionAPI from '../../api/CollectionAPI.js';

class NamedQuerySelector extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			activeNamedQuery: '',
			namedQueryList : []
		}
		CollectionAPI.listRegisteredPlugins((plugins) => {
			console.debug(plugins)
			this.setState({namedQueryList :  plugins});
		});
	}

	generateQueryForm(event) {
		console.debug(event.target.value);
		let arr = event.target.value.split('__')
		let query = this.state.namedQueryList[arr[0]]['queries'].filter((a) => {
			return a.user == arr[1] && a.queryName == arr[2];
		})[0];
		console.debug(query);
		this.setState({activeNamedQuery : query});
	}

	//TODO get the params from this.state.activeNamedQuery.query
	getFormElements() {

	}

	/* ------------------------------------------------------------------------------
	------------------------------- COMMUNICATION WITH OWNER/RECIPE -----------------
	------------------------------------------------------------------------------- */

	onOutput(e) {
		e.preventDefault();
		if(this.props.onOutput) {
			this.props.onOutput(this.constructor.name, this.state.activeNamedQuery);
		}
	}

	render() {
		let namedQuerySelect = '';

		if(this.state.namedQueryList) {

			//the collection selection part
			let namedQueryOptions = Object.keys(this.state.namedQueryList).map((plugin) => {
				return this.state.namedQueryList[plugin]['queries'].map((query) => {
					let optionId = plugin + '__' + query.user + '__' + query.queryName;
					return (
						<option key={optionId} value={optionId}>
							{query.queryName} (user: {query.user},&nbsp;
							query: {plugin}, instance of: {this.state.namedQueryList[plugin]['class']})
						</option>
					)
				})

			});
			namedQueryOptions.splice(0, 0, <option key="null__option" value="">Select a named query</option>);

			namedQuerySelect = (
				<fieldset className="form-group">
					<label>Select named query</label>
					<select className="form-control"
						value={this.state.activeCNamedQuery}
						onChange={this.generateQueryForm.bind(this)}>
						{namedQueryOptions}
					</select>
				</fieldset>
			);


			return (
				<div className="row">
					<div className="col-md-12">
						<form key="collection_selector" onSubmit={this.onOutput.bind(this)}>
							{namedQuerySelect}
							<button className="btn btn-default">
								Select
							</button>
						</form>
					</div>
				</div>
			)
		} else {
			console.debug('Loading list of named queries');
			return (<h3 key="collection_list_loading">Loading list of registered named queries...</h3>)
		}
	}

};

export default NamedQuerySelector;