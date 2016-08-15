import React from 'react';

import FacetSearchComponent from './components/FacetSearchComponent';
import ComparativeSearch from './components/ComparativeSearch';
import LineChart from './components/LineChart';
import FlexBox from './components/FlexBox';
import AnnotationUtil from './util/AnnotationUtil';
import AnnotationBox from './components/annotation/AnnotationBox';
import AnnotationList from './components/annotation/AnnotationList';

//TODO pass the user as (React) context
//TODO pass the annotationSupport as (React) context

class Recipe extends React.Component {
	constructor(props) {
		super(props);
		var annotationTarget = AnnotationUtil.generateW3CTargetObject('http://data.beng.nl/avresearcherxl');
		this.state = {
			user : 'JaapTest',
			lineChartData: null,
			activeAnnotation : null,
			annotationTarget : annotationTarget,
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
	addAnnotationToTarget(targetURI, mimeType, annotation) {
		let at = AnnotationUtil.generateW3CTargetObject(targetURI, mimeType, annotation);
		if(at) {
			this.setState({
				showAnnotationModal: true,
				annotationTarget: at,
				activeAnnotation: null
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

					user={this.state.user} //current user
					activeAnnotation={this.state.activeAnnotation} //the active annotation
					annotationTarget={this.state.annotationTarget} //the current annotation target

					annotationModes={this.props.ingredients.annotationModes} //how each annotation mode/motivation is configured
				/>
			)
			annotationList = (
				<AnnotationList
					activeAnnotation={this.state.activeAnnotation} //the active annotation
					annotationTarget={this.state.annotationTarget} //the current annotation target

					showAnnotationForm={this.showAnnotationForm.bind(this)} //when double clicking an item open the form
					setAnnotation={this.setActiveAnnotation.bind(this)} //when clicking an item change the active annotation

					playerAPI={this.state.playerAPI} //enables the list to play stuff (probably not needed later on)
				/>
			)
		}

		//first generate the input components to see if they require output components, such as the lineChart
		if(this.props.ingredients.comparativeSearch) {
			comparativeSearch = (
				<ComparativeSearch
					user={this.state.user}
					collections={this.props.ingredients.comparativeSearch.collections}

					onOutput={this.onComponentOutput.bind(this)}

					collectionSelector={this.props.ingredients.comparativeSearch.collectionSelector}
					itemDetailsRecipe={this.props.ingredients.itemDetailsRecipe} // the item details recipe the user should go to

					annotationSupport={this.props.ingredients.annotationSupport}
					annotationModes={this.props.ingredients.annotationModes}

					addAnnotationToTarget={this.addAnnotationToTarget.bind(this)} //each annotation support should call this function
				/>);

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
			<div className="row">
				<div className={this.props.ingredients.annotationSupport ? 'col-md-7' : 'col-md-12'}>
					{facetSearch}
					{lineChart}
					{comparativeSearch}
				</div>
				<div className={this.props.ingredients.annotationSupport ? 'col-md-5' : null}>
					{annotationList}
					{annotationBox}
				</div>
			</div>
		);
	}
}

export default Recipe;
