//ugly shit
var $ = require('jquery');
window.$ = $;

import React from 'react';
import CollectionAPI from '../api/CollectionAPI.js';

class CollectionSelector extends React.Component {

	constructor(props) {
		super(props);
		this.state = {

		}
		CollectionAPI.listCollections((collections) => {
			console.debug('fetched the collections from the API!');
			this.setState({collectionList :  collections});
		})
	}

	componentDidMount() {

	}

	//TODO make this a good function for adding/removing selected collections
	addCollection(e) {
		e.preventDefault();
		let collectionId = $('#collection_select option:selected').val();
		this.props.onEditCollections(collectionId);
	}

	render() {
		if(this.state.collectionList) {
			var collectionOptions = this.state.collectionList.map((collection) => {
				return (
					<option key={collection.collection + '__option'} value={collection.collection}>{collection.collection}</option>
				)
			});

			return (
				<form key="collection_selector" onSubmit={this.addCollection.bind(this)}>
		  			<fieldset className="form-group">
						<label htmlFor="collection_select">Select collection</label>
						<select className="form-control" id="collection_select">
							{collectionOptions}
				    	</select>
					</fieldset>
					<button className="btn btn-primary">
						<i className="glyphicon glyphicon-plus"></i>
					</button>
				</form>
			)
		} else {
			console.debug('no collection data available yet');
			return (<h3 key="collection_list_loading">Loading collection list...</h3>)
		}
	}

};

export default CollectionSelector;