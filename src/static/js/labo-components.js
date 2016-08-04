//this function is attached to the window, so it is made accessible within the scope of the HTML page
function showComponent(componentId) {
	var FlexBox = clariah.FlexBox;
	var component = null;

	switch(componentId) {
		case 'Collection analyser': component = getCollectionAnalyser();break;
		case 'Collection selector': component = getCollectionSelector();break;

		case 'Facet search': component = getFacetSearch();break;
		case 'Comparative search': component = getComparativeSearch();break;

		case 'Commenting' : component = getCommentingForm();break;
		case 'Classifying' : component = getClassifyingForm();break;
		case 'Linking' : component = getLinkingForm();break;

		case 'Annotation player': component = getAnnotationPlayer();break;
		case 'JWPlayer': component = getJWPlayer();break;
		case 'Vimeo player': component = getVimeoPlayer();break;

		case 'Line chart': component = getLineChart();break;
	}

	if(component) {
		ReactDOM.render(
			<div className="container">
				<div className="page-header">
					<h3><span className="glyphicon glyphicon-tasks"></span>&nbsp;{componentId}</h3>
				</div>
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

function getCollectionAnalyser() {
	var CollectionAnalyser = clariah.CollectionAnalyser;
	return (
		<CollectionAnalyser/>
	)
}

/*******************************************************************************
************************** Search components ******************************
*******************************************************************************/

function getFacetSearch() {
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
				<FacetSearchComponent collection="labs-catalogue-aggr"
				searchAPI={_config.SEARCH_API_BASE}/>
			</FlexComponentInfo>

		</div>
	);
}

function getComparativeSearch() {

}

/*******************************************************************************
************************** Annotation components ******************************
*******************************************************************************/

function getCommentingForm() {
	var CommentingForm = clariah.CommentingForm;
	return (
		<CommentingForm/>
	);
}

function getClassifyingForm() {
	var ClassifyingForm = clariah.ClassifyingForm;
	var config = {
		vocabularies : ["GTAA", "DBpedia"]
	}
	return (
		<ClassifyingForm config={config}/>
	);
}

function getLinkingForm() {
	var LinkingForm = clariah.LinkingForm;
	var config = {
		apis : [
			{"name" : "wikidata"},
			{"name" : "europeana"}
		]
	}
	return (
		<LinkingForm config={config}/>
	);
}

/*******************************************************************************
************************** Play-out components ******************************
*******************************************************************************/

function getAnnotationPlayer() {
	var FlexPlayer = clariah.FlexPlayer;
	var mediaObject = {url : 'http://os-immix-w/bascollectie/LEKKERLEZEN__-HRE000554F5_63070000_63839000.mp4'};
	var annotationSupport = {
		"currentQuery" : {
			"modes" : ["bookmark"]
		},
		"singleItem" : {
			"modes" : ["bookmark"]
		},
		"mediaObject" : {
			"modes" : ["classify", "comment", "link"]
		},
		"mediaSegment" : {
			"modes" : ["classify", "comment", "link"]
		},
		"annotation" : {
			"modes" : ["comment"]
		}
	};
	var annotationModes = {
		"classify" : {
			"vocabularies" : ["GTAA", "DBpedia"]
		},
		"link" : {
			"apis" : [
				{"name" : "wikidata"},
				{"name" : "europeana"}
			]
		},
		"bookmark" : {},
		"comment" : {}
	};
	return (
		<FlexPlayer user="Component test"
			annotationSupport={annotationSupport}
			annotationModes={annotationModes}
			mediaObject={mediaObject}/>
	);
}

function getVimeoPlayer() {
	var VimeoPlayer = clariah.VimeoPlayer;
	var mediaObject = {url : 'http://player.vimeo.com/video/176894130?api=1&amp;player_id=player_1'};
	return (
		<VimeoPlayer mediaObject={mediaObject}/>
	);
}

function getJWPlayer() {
	var JWPlayer = clariah.JWPlayer;
	var mediaObject = {url : 'http://os-immix-w/bascollectie/LEKKERLEZEN__-HRE000554F5_63070000_63839000.mp4'};
	return (
		<JWPlayer mediaObject={mediaObject}/>
	);
}

/*******************************************************************************
************************** Data visualisations ******************************
*******************************************************************************/

function getLineChart() {
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
