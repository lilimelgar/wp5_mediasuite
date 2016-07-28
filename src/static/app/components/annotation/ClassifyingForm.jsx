import Autosuggest from 'react-autosuggest';

class ClassifyingForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			value : '',
			isLoading : false,
			suggestions : []
		}
	}

	getSuggestions(value, callback) {
		var url = "/autocomplete?vocab=GTAA&term=" + value;
	    d3.json(url, function(error, data) {
	        callback(data);
	    });
	}

	addClassification(e) {
		e.preventDefault();
		var cs = this.props.data;
		cs.push(this.state.value);
		this.props.updateAnnotationData('classifications', cs);
		this.setState({value : ''});
	}

	removeClassification(index) {
		var cs = this.props.data;
		cs.splice(index, 1);
		this.props.updateAnnotationData('classifications', cs);
	}

	loadSuggestions(value) {
		this.setState({
			isLoading: true
		});
		if(value.value === this.state.chosenValue) {
			this.setState({
				isLoading: false
			});
		} else {
			this.getSuggestions(value.value, (data) => {
				if(data.error) {
					this.setState({
						isLoading: false,
						suggestions: []
					});
				} else {
					this.setState({
						isLoading: false,
						suggestions: data
					});
				}
			});
		}
	}

	getSuggestionValue(suggestion) {
  		return suggestion.label.split('|')[0];
	}

	renderSuggestion(suggestion) {
		let arr = suggestion.label.split('|');
		let label = arr[1];
		switch(arr[1]) {
			case 'Persoon' : label = (<span className="label label-warning">Persoon</span>);break;
			case 'Maker' : label = (<span className="label label-warning">Maker</span>);break;
			case 'Geografisch' : label = (<span className="label label-success">Locatie</span>);break;
			case 'Naam' : label = (<span className="label label-info">Naam</span>);break;
			case 'Onderwerp' : label = (<span className="label label-primary">Onderwerp</span>);break;
			case 'Genre' : label = (<span className="label label-default">Genre</span>);break;
			case 'B&G Onderwerp' : label = (<span className="label label-danger">B&G Onderwerp</span>);break;


		}
		return (
			<span>{arr[0]}{label}</span>
		);
	}

	onSuggestionsUpdateRequested(value) {
		this.loadSuggestions(value);
	}

	onChange(event, { newValue }) {
		this.setState({
			chosenValue: newValue,
			value: newValue
		});
	}

	render() {
		const classifications = this.props.data.map((c, index) => {
			return (
				<span key={'cl__' + index}>
					<span className="label label-success tag" onClick={this.removeClassification.bind(this, index)}>
						{c}
						<i className="glyphicon glyphicon-minus"></i>
					</span>&nbsp;
				</span>
			)
		}, this);
		const inputProps = {
			placeholder: "Zoek een GTAA term",
			value: this.state.value,
			onChange: this.onChange.bind(this)
		};
		//<input ref="classifications" type="text" className="form-control" placeholder="Add one or more tags"/>
		return (
			<div key={'form__classify'} className="row">
				<div className="col-md-12">
					<form>
						<div className="form-group">
							<label htmlFor="classifications">Add classifications</label>

							<Autosuggest
								ref="classifications"
								suggestions={this.state.suggestions}
                     			onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested.bind(this)}
                     			getSuggestionValue={this.getSuggestionValue.bind(this)}
                     			renderSuggestion={this.renderSuggestion.bind(this)}
                     			inputProps={inputProps}
                     		/>
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