import React from 'react';

import CollectionSelector from './components/CollectionSelector.jsx';
import FacetSearchComponent from './components/FacetSearchComponent.jsx';
import LineChart from './components/LineChart.jsx';
import FlexBox from './components/FlexBox.jsx';

import CollectionUtil from './util/CollectionUtil.js';
import CollectionAPI from './api/CollectionAPI.js';

class Recipe extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			searchBlocks: [],//holds the FacetSearchComponents that are currently on the screen
			queryOutputs: null,//if this state var is updated the LineChart is rerendered (default React behavior)
			activeSearchTab: null //add the active collections
		};
	}

	//the queryOutputs variable are consumed by multiquery visualisations (currently only the LineChart component is available)
	updateQueryOutput(queryId, output, dateField) {
		var queryOutputs = this.state.queryOutputs ? this.state.queryOutputs : {};
		queryOutputs[queryId] = {
  			output : output,
  			dateField : dateField
  		}
  		this.setState({queryOutputs : queryOutputs});
	}

	//parse the ingredients before rendering
	componentDidMount() {
		this.loadCollections(this.props.ingredients.collections);
	}

	loadCollections(collectionIds) {
		for(let i=0;i<collectionIds.length;i++) {
	  		let collectionId = collectionIds[i];
	  		CollectionAPI.getCollectionStats(collectionId, function(data) {
	  			let b = this.state.searchBlocks;
	  			b.push(this.createSearchBlock(data));
	  			this.setState({
	  				searchBlocks: b
	  			});
	  			if(b && b.length > 0) {
	  				this.setState({
	  					activeSearchTab: b[0].elementId
	  				})
	  			}
	  		}.bind(this));
  		}
	}

	createSearchBlock(stats) {
		let config = CollectionUtil.determineConfig(stats.service.collection);
		let docType = CollectionUtil.determineDocType(stats, config);
		let searchableFields = CollectionUtil.determineSearchableFields(stats, config);
		let dateFields = CollectionUtil.determineDateFields(stats, config);
		let facets = CollectionUtil.determineFacets(dateFields, config);

		var block = {//TODO optimize this later so most things are passed via the config, i.e. collection mapping
			elementId : stats.service.collection,
			dateFields: dateFields,
			prefixQueryFields: searchableFields,
			facets: facets
		}
		return block;
	}

	toggleMinimize(blockId, event) {
		let activeBlocks = this.state.activeBlocks;

		if(activeBlocks.indexOf(blockId) != -1) {
			activeBlocks.splice(activeBlocks.indexOf(blockId), 1);
		} else {
			activeBlocks.push(blockId);
		}
		this.setState({activeBlocks: activeBlocks});
	}

	//TODO this function needs to be properly checked to see if all stuff is removed properly
	//FIXME update the stuff in the LineChart!
	removeCollection(collectionId) {
		let b = this.state.searchBlocks;
		let qops = this.state.queryOutputs;
		for(let i=b.length-1;i>=0;i--) {
			if(b[i].elementId == collectionId) {
				b.splice(i, 1);
				if(qops != null && qops[collectionId]) {
					delete qops[collectionId];
				}
			}
		}
	  	this.setState({
			searchBlocks : b,
			queryOutputs : qops
		})
	}

	//TODO this function should never load a collection that has been already loaded
	onEditCollections(collectionId) {
		this.loadCollections([collectionId]);
	}

	render() {
		//for drawing the tabs
		var searchTabs = this.state.searchBlocks.map(function(searchBox) {
			return (
				<li key={searchBox.elementId + '__tab_option'} className={
					this.state.activeSearchTab == searchBox.elementId ? 'active' : ''
				}><a data-toggle="tab" href={'#' + searchBox.elementId}>
				{searchBox.elementId}
				<i className="glyphicon glyphicon-minus" onClick={
					() => (this.removeCollection(searchBox.elementId))
				}></i>
				</a></li>
				)
		}, this)

		//these are the facet search UI blocks put into different tabs
		var searchTabContents = this.state.searchBlocks.map(function(searchBox) {
			return (
				<div key={searchBox.elementId + '__tab_content'} id={searchBox.elementId} className={
					this.state.activeSearchTab == searchBox.elementId ? 'tab-pane active' : 'tab-pane'
				}>
				<h3>{searchBox.elementId}</h3>
				<FacetSearchComponent
					key={searchBox.elementId + '__sk'}
					blockId={searchBox.elementId}
					searchAPI={_config.SEARCH_API_BASE}
					indexPath={'/search/' + searchBox.elementId}
					onQueryOutput={this.updateQueryOutput.bind(this)}
					prefixQueryFields={searchBox.prefixQueryFields}
					dateFields={searchBox.dateFields}
					facets={searchBox.facets}
				/>
				</div>
				);
		}, this);

		var lineChart = null;
		if(this.props.ingredients.lineChart) {
			lineChart = <FlexBox><LineChart data={this.state.queryOutputs}/></FlexBox>;
		}

		var collectionSelector = null;
		if(this.props.ingredients.collectionSelector) {
			collectionSelector = <FlexBox><CollectionSelector onEditCollections={this.onEditCollections.bind(this)}/></FlexBox>;
		}

		return (
			<div>
				{collectionSelector}
				{lineChart}
				<FlexBox>
					<ul className="nav nav-tabs">
						{searchTabs}
					</ul>
					<div className="tab-content">
						{searchTabContents}
					</div>
				</FlexBox>
			</div>
		);
	}
}

export default Recipe;