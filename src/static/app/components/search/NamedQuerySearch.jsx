import NamedQuerySelector from '../collection/NamedQuerySelector';
import SearchPluginAPI from '../../api/SearchPluginAPI';

class NamedQuerySearch extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			user : this.props.user,
			plugin : this.props.plugin,
			queryName: this.props.queryName,
			activeNamedQuery: this.props.namedQuery,
			currentOutput: null //could also be a default state value for components which implement onOutput

		}

		SearchPluginAPI.getNamedQuery(this.state.plugin, this.state.user, this.state.queryName, (plugin) => {
			console.debug(plugin);
			this.setState({activeNamedQuery :  plugin});
		});
	}


	getQueryParams() {
		let matches = this.state.activeNamedQuery.query.match(/___(.*?)___/g);
		return [...new Set(matches)];
	}

	submitNamedQuery(e) {
		e.preventDefault();
		console.debug(this.state.activeNamedQuery);

		let params = this.getQueryParams();
		let values = {};
		params.forEach((p)=>{
			let key = p.replace(/___/g, '');
			values[key] = this.refs[key].value;
		})
		SearchPluginAPI.executeNamedQuery(
			this.state.activeNamedQuery.plugin,
			this.state.activeNamedQuery.user,
			this.state.activeNamedQuery.queryName,
			values,
			(data) => {
				console.debug(data);
				console.debug(this.onOutput);
				this.onOutput.call(this, this.constructor.name, data);
			}
		);
	}

	/* ------------------------------------------------------------------------------
	------------------------------- COMMUNICATION WITH OWNER/RECIPE -----------------
	------------------------------------------------------------------------------- */

	onOutput(componentClass, data) {
		console.debug(componentClass);
		//passes along the output to the owner (if specified in the props)
		if(this.props.onOutput) {
			this.props.onOutput(componentClass, data);
		}
		//stores the current output of the last search in the state (for bookmarking)
		if(componentClass == 'NamedQuerySearch') {
			this.setState({currentOutput: data});
		}
	}


	/* ---------------------- RENDER ------------------- */

	render() {
		let queryForm = null;
		let resultList = null;
		//generates the query form
		if(this.state.activeNamedQuery) {
			let queryFormFields = this.getQueryParams().map((key) => {
				key = key.replace(/___/g, '');
				return (
					<div key={'__qf__' + key} className="form-group">
						<label htmlFor={'__qfi__' + key}>{key}</label>
						<input ref={key} type="text" className="form-control" id={'__qfi__' + key}/>
					</div>
				)
			});
			if(queryFormFields.length > 0) {
				queryForm = (
					<form key="query_form" onSubmit={this.submitNamedQuery.bind(this)}>
						{queryFormFields}
						<button className="btn btn-default">
							Submit query
						</button>
					</form>
				)
			}
		}

		//TODO make this better (check for empty stuff)
		if(this.state.currentOutput) {
			let resultItems = this.state.currentOutput.hits.hits.map((hit)=> {
				let properties = Object.keys(hit._source).map((key, index) => {
					return (
						<tr key={index}>
							<td><strong>{key}:&nbsp;&nbsp;</strong></td>
							<td>{hit._source[key]}</td>
						</tr>
					);
				})
				return (
					<div key={hit._id} style={{border: '1px solid dodgerblue', margin: '5px', padding: '10px'}}>
						<table>
							<tbody>
								{properties}
							</tbody>
						</table>
					</div>
				)
			});
			console.debug(resultItems)
			resultList = (
				<div>
					Found: {this.state.currentOutput.hits.hits.length}
					{resultItems}
				</div>
			)
		}

		return (
			<div>
				<div className="row">
					<div className="col-md-12">
						{queryForm}
						{resultList}
					</div>
				</div>
			</div>
		)
	}
}

export default NamedQuerySearch;