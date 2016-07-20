//this function is attached to the window, so it is made accessible within the scope of the HTML page
function showComponent(componentId) {
	var FlexBox = clariah.FlexBox;
	var component = null;

	switch(componentId) {
		case 'collection-selector': component = getCollectionSelector();break;
		case 'collection-stats': component = getCollectionStats();break;
		case 'facet-search': component = getFacetSearchComponent();break;
		case 'search-result': component = getSearchResult();break;
		case 'item-details': component = getItemDetails();break;

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
	/*
	<FacetSearchComponent
					key="testbox"
					blockId="labs-catalogue-aggr"
					searchAPI={_config.SEARCH_API_BASE}
					indexPath={ '/search/labs-catalogue-aggr'}
					prefixQueryFields={config.getSearchableFields()}
					dateFields={config.getDateFields()}
					facets={config.getFacets()}
				/>
	*/
}

function getSearchResult() {
	var SearchResult = clariah.SearchResult;
	var data = {
		title : 'This is a good test',
		date : 'somewhere in the future',
		description : 'Well well well'
	}
	return (
		<SearchResult data={data}/>
	)
}

function getItemDetails() {
	var ItemDetails = clariah.ItemDetails;
	var data = {
		title : 'This is a good test',
		date : 'somewhere in the future',
		description : 'Well well well'
	}
	return (
		<ItemDetails data={data}/>
	)
}

window.showComponent = showComponent;