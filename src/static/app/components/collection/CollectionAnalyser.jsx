//ugly shit
var $ = require('jquery');
window.$ = $;

import React from 'react';

import CollectionAPI from '../../api/CollectionAPI.js';

import CollectionStats from './CollectionStats.jsx';

import LineChart from '../stats/LineChart.jsx';

import FlexBox from '../FlexBox.jsx';
//import CollectionSelector from './CollectionSelector.jsx';

class CollectionAnalyser extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			activeCollectionStats: null,
			activeDocumentType: null,
			activeDateField: null,
			activeAnalysisField: null,
			activeTimelineData: null
		}
		CollectionAPI.listCollections((collections) => {
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
			let docTypeStats = data.collection_statistics.document_types[0];
			let defaultField = docTypeStats.fields.date[0];

			this.setState(
				{
					activeCollection: collectionId,
					activeCollectionStats : data,
					activeDocumentTypeStats : docTypeStats,
					activeDocumentType : docTypeStats.doc_type
				}
			);
			this.analyseField();
		});
	}

	setCollectionFields() {
		let select = document.getElementById("doctype_select");
		let docType = select.options[select.selectedIndex].value;

		console.debug('fetching document type info');

		this.state.activeCollectionStats.collection_statistics.document_types.forEach((docTypeStats) => {
			if (docTypeStats.doc_type === docType) {
				let defaultField = docTypeStats.fields.date[0];
				this.setState(
					{
						activeDocumentType : docTypeStats.doc_type,
						activeDocumentTypeStats : docTypeStats
					}
				);
				this.analyseField();
			}
		})
	}

	analyseField(){
		let analysisSelect = document.getElementById("analysisfield_select");
		let analysisField = analysisSelect.options[analysisSelect.selectedIndex].value;

		let dateSelect = document.getElementById("datefield_select");
		let dateField = dateSelect.options[dateSelect.selectedIndex].value;

		console.debug('fetching field analysis info');
		console.debug("date field:" + dateField);
		console.debug("analysis field:" + analysisField);
		var facets = [];

		CollectionAPI.analyseField(this.state.activeCollection, this.state.activeDocumentType, dateField, analysisField, facets, (data) => {
			let timelineData = this.setTimelineData(data);
			this.setState(
				{
					activeAnalysisData : data,
					activeTimelineData : timelineData
				}
			)
		});
	}

	setTimelineData(data){
		let timelineData = {
			"total": {"timeline": []},
			"present": {"timeline": []},
			"missing": {"timeline": []}
		};
		for (let item in data.timeline) {
			timelineData.total.timeline.push({"year": data.timeline[item].year, "count": data.timeline[item].background_count, "query": "total"});
			timelineData.present.timeline.push({"year": data.timeline[item].year, "count": data.timeline[item].field_count, "query": "present"});
			timelineData.missing.timeline.push({"year": data.timeline[item].year, "count": data.timeline[item].background_count - data.timeline[item].field_count, "query": "missing"});
		}
		return timelineData;
	}

	//TODO make this a good function for adding/removing selected collections
	addCollection(e) {
		e.preventDefault();
		let collectionId = $('#collection_select option:selected').val();
		//propagate the choice to the overarching Recipe.jsx (TODO this should be reflected as a state var instead)
		if(this.props.onEditCollections) {
			this.props.onEditCollections(collectionId);
		}
		document.getElementById('collection_select').selectedIndex = 0;
	}

	render() {
		let collectionSelect = '';
		let documentTypeSelect = '';
		let dateFieldSelect = '';
		let analysisFieldSelect = '';
		let collectionStats = '';
		let collectionTimeline = '';
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

			collectionTimeline = <LineChart data={this.state.activeTimelineData}/>

			//the document type selection part
			if(this.state.activeCollectionStats) {
				let docTypeOptions = this.state.activeCollectionStats.collection_statistics.document_types.map((docType) => {
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

			}

			//the analysis and date field selection part
			if(this.state.activeDocumentTypeStats) {
				let dateFieldOptions = this.state.activeDocumentTypeStats.fields.date.map((dateField) => {
					return (
						<option key={dateField} value={dateField}>{dateField}</option>
					)
				});

				dateFieldSelect = (
					<fieldset className="form-group">
						<label htmlFor="datefield_select">Select date field</label>
						<select className="form-control" id="datefield_select" onChange={this.analyseField.bind(this)}>
							{dateFieldOptions}
						</select>
					</fieldset>
				);

				let fieldTypes = Object.keys(this.state.activeDocumentTypeStats.fields);
				let analysisFieldOptions = [];
				fieldTypes.forEach((fieldType) => {
					this.state.activeDocumentTypeStats.fields[fieldType].forEach((fieldName) => {
						analysisFieldOptions.push(
							<option key={fieldName} value={fieldName}>{fieldName}</option>
						)
					});
				});

				analysisFieldSelect = (
					<fieldset className="form-group">
						<label htmlFor="analysisfield_select">Select analysis field</label>
						<select className="form-control" id="analysisfield_select" onChange={this.analyseField.bind(this)}>
							{analysisFieldOptions}
						</select>
					</fieldset>
				);
			}

			if(this.state.activeAnalysisData) {
				//draw the stats
				collectionStats = (<CollectionStats data={this.state.activeAnalysisData}/>);
			}

			return (
				<div>
					<div className="row">
						<div className="col-md-5">
							<form key="collection_analyser" onSubmit={this.addCollection.bind(this)}>
								{collectionSelect}
								{documentTypeSelect}
								{dateFieldSelect}
								{analysisFieldSelect}
							</form>
						</div>
						<div className="col-md-6">
							{collectionStats}
						</div>
					</div>
					<div className="row">
						<div className="col-md-10">
							{collectionTimeline}
						</div>
					</div>
				</div>
			)
		} else {
			console.debug('no collection data available yet');
			return (<h3 key="collection_list_loading">Loading collection list...</h3>)
		}
	}

};

export default CollectionAnalyser;
