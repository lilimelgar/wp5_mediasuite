import React from 'react';

import FacetSearchComponent from './components/search/FacetSearchComponent';
import ComparativeSearch from './components/search/ComparativeSearch';

import AnnotationBox from './components/annotation/AnnotationBox';
import AnnotationList from './components/annotation/AnnotationList';

import LineChart from './components/stats/LineChart';

import FlexBox from './components/FlexBox';

import AnnotationUtil from './util/AnnotationUtil';



//TODO pass the user as (React) context
//TODO pass the annotationSupport as (React) context

class Recipe extends React.Component {
	constructor(props) {
		super(props);
		var user = 'JaapTest';
		var annotation = AnnotationUtil.generateW3CEmptyAnnotation(user, 'http://data.beng.nl/avresearcherxl');
		this.state = {
			user : user,
			lineChartData: null,
			activeAnnotation : null,
			annotationTarget : annotation.target,
			showAnnotationModal : false
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

	/* ------------------------------------------------------------------------------
	------------------------------- ANNOTATION RELATED FUNCTIONS --------------------
	------------------------------------------------------------------------------- */

	//overall there can be only one active annotation
	setActiveAnnotation(annotation) {
		this.setState({
			activeAnnotation : annotation
		})
	}

	//shows the annotation modal
	showAnnotationForm() {
		this.setState({showAnnotationModal: true})
	}

	//hides the annotation modal
	hideAnnotationForm() {
		this.setState({showAnnotationModal: false})
	}

	//show the annnotation form with the correct annotation target
	//TODO extend this so the target can also be a piece of text or whatever
	editAnnotation(annotation) {
		if(annotation.target) {
			this.setState({
				showAnnotationModal: true,
				annotationTarget: annotation.target,
				activeAnnotation: annotation
			});
		}
	}

	render() {
		var comparativeSearch = null;
		var facetSearch = null;
		var lineChart = null; //WARNING: in theory there can be more linecharts defined!
		var annotationBox = null;
		var annotationList = null;

		if(this.props.ingredients.annotationSupport) {
			annotationBox = (
				<AnnotationBox
					showModal={this.state.showAnnotationModal} //show the modal yes/no
					hideAnnotationForm={this.hideAnnotationForm.bind(this)} //pass along the function to hide the modal

					activeAnnotation={this.state.activeAnnotation} //the active annotation
					annotationModes={this.props.ingredients.annotationModes} //how each annotation mode/motivation is configured
				/>
			)
			annotationList = (
				<AnnotationList
					activeAnnotation={this.state.activeAnnotation} //the active annotation
					annotationTarget={this.state.annotationTarget} //the current annotation target

					showAnnotationForm={this.showAnnotationForm.bind(this)} //when double clicking an item open the form
					setAnnotation={this.setActiveAnnotation.bind(this)} //when clicking an item change the active annotation
				/>
			)
		}

		//first generate the input components to see if they require output components, such as the lineChart
		if(this.props.ingredients.comparativeSearch) {
			comparativeSearch = (
				<FlexBox><ComparativeSearch
					user={this.state.user}
					collections={this.props.ingredients.comparativeSearch.collections}

					onOutput={this.onComponentOutput.bind(this)}

					collectionSelector={this.props.ingredients.comparativeSearch.collectionSelector}
					itemDetailsRecipe={this.props.ingredients.itemDetailsRecipe} // the item details recipe the user should go to

					annotationSupport={this.props.ingredients.annotationSupport}

					editAnnotation={this.editAnnotation.bind(this)} //each annotation support should call this function
				/></FlexBox>);

			//TODO only render when there is linechart data
			if(this.props.ingredients.comparativeSearch.output == 'lineChart') {
				lineChart = <FlexBox><LineChart data={this.state.lineChartData}/></FlexBox>;
			}
		}
		if(this.props.ingredients.facetSearch) {
			facetSearch = (<FacetSearchComponent
				itemDetailsRecipe={this.props.ingredients.itemDetailsRecipe} // the item details recipe the user should go to
				collection={this.props.ingredients.facetSearch.collection}
				searchAPI={_config.SEARCH_API_BASE}/>);
		}

		return (
			<div>
				<div className="row">
					<div className="col-md-12">
						{annotationList}
						{annotationBox}
						<br/>
					</div>
				</div>
				<div className="row">
					<div className="col-md-12">
						{facetSearch}
						{lineChart}
						{comparativeSearch}
					</div>
				</div>
			</div>
		);
	}
}

export default Recipe;
