import React from 'react';

import FacetSearchComponent from './components/FacetSearchComponent.jsx';
import ComparativeSearch from './components/ComparativeSearch.jsx';
import LineChart from './components/LineChart.jsx';
import FlexBox from './components/FlexBox.jsx';

import CollectionUtil from './util/CollectionUtil.js';
import CollectionAPI from './api/CollectionAPI.js';

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
		var lineChart = null;
		if(this.props.ingredients.lineChart) {
			lineChart = <FlexBox><LineChart data={this.state.lineChartData}/></FlexBox>;
		}

		return (
			<div>
				{lineChart}
				<ComparativeSearch collections={this.props.ingredients.collections}
					onOutput={this.onComponentOutput.bind(this)}/>
			</div>
		);
	}
}

export default Recipe;
