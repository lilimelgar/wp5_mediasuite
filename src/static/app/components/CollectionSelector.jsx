//ugly shit
var $ = require('jquery');
window.$ = $;

import React from 'react';
import CollectionAPI from '../api/CollectionAPI.js';
import CollectionStats from './CollectionStats.jsx';

class CollectionSelector extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			activeCollectionStats: null,
			activeDocumentType: null,
			activeDateField: null,
			activeFacetField: null
		}
		CollectionAPI.listCollections((collections) => {
			collections.sort((a, b) => { //FIXME this should be done on the server!
				if(a.collection < b.collection) return -1;
    			if(a.collection > b.collection) return 1;
    			return 0;
			});
			this.setState({collectionList :  collections});
		});
	}

	componentDidMount() {

	}

	setDocumentTypes() {
		let select = document.getElementById("collection_select");
		let collectionId = select.options[select.selectedIndex].value;

		CollectionAPI.getCollectionStats(collectionId, (data) => {
			console.debug('fetched the collections stats for ' + collectionId);
			console.debug(data);

			this.setState({activeCollectionStats : data});
		});
	}

	setCollectionFields() {
		console.debug('This shit is f#in redickluss');
	}

	//TODO make this a good function for adding/removing selected collections
	addCollection(e) {
		e.preventDefault();
		let collectionId = $('#collection_select option:selected').val();
		//propagate the choice to the overarching Recipe.jsx (TODO this should be reflected as a state var instead)
		this.props.onEditCollections(collectionId);
		document.getElementById('collection_select').selectedIndex = 0;
	}

	render() {
		let collectionSelect = '';
		let documentTypeSelect = '';
		let dateFieldSelect = '';
		let facetFieldSelect = '';
		let collectionStats = '';
		if(this.state.collectionList) {

			//the collection selection part
			let collectionOptions = this.state.collectionList.map((collection) => {
				return (
					<option key={collection.collection + '__option'} value={collection.collection}>
						{collection.collection}
						&nbsp;
						({collection.doc_count})
					</option>
				)
			});
			collectionOptions.splice(0, 0, <option key="null__option" value="">Select a collection</option>);

			collectionSelect = (
				<fieldset className="form-group">
					<label htmlFor="collection_select">Select collection</label>
					<select className="form-control" id="collection_select" onChange={this.setDocumentTypes.bind(this)}>
						{collectionOptions}
					</select>
				</fieldset>
			);

			//the document type selection part
			if(this.state.activeCollectionStats) {
				let docTypeOptions = this.state.activeCollectionStats.collection_statistics.document_types.map((docType) => {
					console.debug(docType);
					return (
						<option key={docType.doc_type} value={docType.doc_type}>{docType.doc_type}</option>
					)
				});

				documentTypeSelect = (
					<fieldset className="form-group">
						<label htmlFor="doctype_select">Select document type</label>
						<select className="form-control" id="doctype_select" onChange={this.setCollectionFields.bind(this)}>
							{docTypeOptions}
						</select>
					</fieldset>
				);

				//draw the stats too
				collectionStats = (<CollectionStats data={this.state.activeCollectionStats}/>);
			}

			//the facet and date field selection part
			if(this.state.activeDocumentType) {

			}

			return (
				<div className="row">
					<div className="col-md-5">
						<form key="collection_selector" onSubmit={this.addCollection.bind(this)}>
							{collectionSelect}
							{documentTypeSelect}
							{dateFieldSelect}
							{facetFieldSelect}
							<button className="btn btn-primary">
								Add to recipe&nbsp;<i className="glyphicon glyphicon-plus"></i>
							</button>
						</form>
					</div>
					<div className="col-md-5">
						{collectionStats}
					</div>
				</div>
			)
		} else {
			console.debug('no collection data available yet');
			return (<h3 key="collection_list_loading">Loading collection list...</h3>)
		}
	}

};

export default CollectionSelector;