import React from 'react';

import FacetSearchComponent from './components/FacetSearchComponent.jsx';
import ComparativeSearch from './components/ComparativeSearch.jsx';
import LineChart from './components/LineChart.jsx';
import FlexBox from './components/FlexBox.jsx';

//TODO pass the user as (React) context
//TODO pass the annotationSupport as (React) context

class Recipe extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			user : 'JaapTest',
			lineChartData: null
		};
	}

	//this function receives all output of components that generate output and orchestrates where
	//to pass it to based on the ingredients of the recipe
	onComponentOutput(componentType, data) {
		if(componentType == 'facet-search') {
			var lineChartData = this.state.lineChartData ? this.state.lineChartData : {};
			var timelineData = this.prepareTimeline(data.collectionId, data.results, data.dateField);
			lineChartData[data.collectionId] = {
	  			output : data.output,
	  			dateField : data.dateField,
				timeline : timelineData
	  		}
	  		this.setState({lineChartData : lineChartData});
	  	}
	}

	//TODO move this stuff to some utility that can transform query data in other formats suitable for other components
	prepareTimeline(queryId, queryOutput, dateField) {
		var timelineData = [];
		for (let key in queryOutput.aggregations) {
			if (key.indexOf(dateField) != -1) {
				var buckets = queryOutput.aggregations[key][dateField].buckets;
				buckets.forEach((bucket) => {
					var year = parseInt(bucket.key);
					if (!(isNaN(year))) {
						timelineData.push({"year": year, "count": bucket.doc_count, "query": queryId});
					}
				});
			}
		}
		return timelineData;
	}

	render() {
		var comparativeSearch = null;
		var facetSearch = null;
		var lineChart = null; //WARNING: in theory there can be more linecharts defined!

		//first generate the input components to see if they require output components, such as the lineChart
		if(this.props.ingredients.comparativeSearch) {
			comparativeSearch = (<ComparativeSearch user={this.state.user}
					collections={this.props.ingredients.comparativeSearch.collections}
					onOutput={this.onComponentOutput.bind(this)}
					collectionSelector={this.props.ingredients.comparativeSearch.collectionSelector}
					annotationSupport={this.props.ingredients.annotationSupport}
					annotationModes={this.props.ingredients.annotationModes}/>);

			if(this.props.ingredients.comparativeSearch.output == 'lineChart') {
				lineChart = <FlexBox><LineChart data={this.state.lineChartData}/></FlexBox>;
			}
		}
		if(this.props.ingredients.facetSearch) {
			facetSearch = (<FacetSearchComponent
				collection={this.props.ingredients.facetSearch.collection}
				searchAPI={_config.SEARCH_API_BASE}/>);
		}

		return (
			<div>
				{facetSearch}
				{lineChart}
				{comparativeSearch}
			</div>
		);
	}
}

export default Recipe;
