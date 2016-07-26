//this function is attached to the window, so it is made accessible within the scope of the HTML page
function showComponent(componentId) {
	var FlexBox = clariah.FlexBox;
	var component = null;

	switch(componentId) {
		case 'collection-selector': component = getCollectionSelector();break;
		case 'collection-stats': component = getCollectionStats();break;
		case 'collection-analyser': component = getCollectionAnalyser();break;
		case 'facet-search': component = getFacetSearchComponent();break;
		case 'line-chart': component = getLineChartComponent();break;

	}
	if(component) {
		ReactDOM.render(
			<div>
			{component}
			</div>, document.getElementById('component_x')
		);
	}
}

/*******************************************************************************
************************** Collection components ******************************
*******************************************************************************/

function getCollectionSelector() {
	var CollectionSelector = clariah.CollectionSelector;
	return (
		<CollectionSelector/>
	)
}

function getCollectionStats() {
	var CollectionStats = clariah.CollectionStats;
	var data = {
		service : {
			collection : 'Test collection'
		}
	}
	return (
		<CollectionStats data={data}/>
	)
}

function getCollectionAnalyser() {
	var CollectionAnalyser = clariah.CollectionAnalyser;
	return (
		<CollectionAnalyser/>
	)
}

/*******************************************************************************
************************** Search components ******************************
*******************************************************************************/

function getFacetSearchComponent() {
	var FacetSearchComponent = clariah.FacetSearchComponent;
	var FlexComponentInfo = clariah.FlexComponentInfo;
	var config = new clariah.NISVCatalogueConfig();
	return (
		<div>
			<FlexComponentInfo
				title="Facet search"
				description="This component enables you to search a single collection using full text search and filtering
				on different facets. Coming up: configuration options for end users"
				config={config}
			>
				<FacetSearchComponent/>
			</FlexComponentInfo>

		</div>
	)
}

/*******************************************************************************
************************** Data visualisations ******************************
*******************************************************************************/

function getLineChartComponent() {
	var LineChart = clariah.LineChart;
	var FlexComponentInfo = clariah.FlexComponentInfo;
	return (
		<div>
			<FlexComponentInfo
				title="Line chart"
				description="This line chart is able to plot multiple paths of 2 dimensional data"
			>
				<LineChart/>
			</FlexComponentInfo>

		</div>
	)
}


window.showComponent = showComponent;
