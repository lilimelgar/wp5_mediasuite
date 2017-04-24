//this function is attached to the window, so it is made accessible within the scope of the HTML page
function showComponent(componentId) {
	var FlexBox = labo.FlexBox;
	var component = null;

	switch(componentId) {
		case 'Collection analyser': getCollectionAnalyser(componentId, componentLoaded);break;
		case 'Collection selector': getCollectionSelector(componentId, componentLoaded);break;
		case 'Query builder': getQueryBuilder(componentId, componentLoaded);break;
		case 'Comparative search': getComparativeSearch(componentId, componentLoaded);break;
		case 'Commenting' : getCommentingForm(componentId, componentLoaded);break;
		case 'Classifying' : getClassifyingForm(componentId, componentLoaded);break;
		case 'Linking' : getLinkingForm(componentId, componentLoaded);break;
		case 'Segmenting player': getAnnotationPlayer(componentId, componentLoaded);break;
		case 'JWPlayer': getJWPlayer(componentId, componentLoaded);break;
		case 'Vimeo player': getVimeoPlayer(componentId, componentLoaded);break;
		case 'YouTube player': getYouTubePlayer(componentId, componentLoaded);break;
		case 'Image viewer': getImageViewer(componentId, componentLoaded);break;
		case 'Line chart': getLineChart(componentId, componentLoaded);break;
	}
}

function componentLoaded(componentId, component) {
	if(component) {
		//first clear the previous stuff (rerendering for the  video players gives problems)
		ReactDOM.unmountComponentAtNode(document.getElementById('component_x'));

		//render the React component inside the component div
		ReactDOM.render(
			<div className="col-md-12">
				<div className="page-header">
					<h3><span className="glyphicon glyphicon-tasks"></span>&nbsp;{componentId}</h3>
				</div>
				{component}
			</div>, document.getElementById('component_x')
		);
		if(componentId == 'Image viewer') { // it's weird that it does not work on this page without this
			document.getElementById('img_viewer__mo_1').style.height = '800px';
		}
	}
}

/*******************************************************************************
************************** Collection components ******************************
*******************************************************************************/

function getCollectionSelector(componentId, callback) {
	var CollectionSelector = labo.CollectionSelector;
	var FlexComponentInfo = labo.FlexComponentInfo;
	callback(componentId,
		<div>
			<FlexComponentInfo
				title="CollectionSelector"
				description="Enables the selection of a collection exposed via a valid implementation of the Search API"
				input="URL to a valid Search API"
				output="A collection ID; URL to the referred Search API"
				outputComponents={['FacetSearch']}
				currentInput={['http://blofeld.beeldengeluid.nl:5320/api/v1']}
			/>
			<CollectionSelector
				showSelect={true}
				showBrowser={true}
				showStats={false}/>
		</div>
	)
}

function getCollectionAnalyser(componentId, callback) {
	var CollectionAnalyser = labo.CollectionAnalyser;
	var params = {
		collectionSelector : true,
		fieldAnalysisStats : true,
		collectionStats : true,
		timeline : true
	}
	callback(componentId,
		<CollectionAnalyser params={params}/>
	)
}

/*******************************************************************************
************************** Search components ******************************
*******************************************************************************/

function getQueryBuilder(componentId, callback) {
	console.debug('well? what is this');
	var QueryBuilder = labo.QueryBuilder;
	var CollectionUtil = labo.CollectionUtil;
	CollectionUtil.generateCollectionConfig('nisv', function(data){
		callback(componentId,
			<QueryBuilder
				queryId="test"
				collectionConfig={data}
				pageSize={10}
				aggregationView="box"
				timeSlider={true}
				searchAPI={_config.SEARCH_API_BASE}
				header={true}/>
		);
	}, true);
}

function getComparativeSearch(componentId, callback) {
	var ComparativeSearch = labo.ComparativeSearch;
	var FlexComponentInfo = labo.FlexComponentInfo;
	callback(componentId,
		<div>
			<FlexComponentInfo
				title="ComparativeSearch"
				description="Enables the selection of multiple collections for side-by-side facet search"
				input="URL to a valid Search API; various configuration options (t.b.d)"
				output="A dictionary holding the query output of all selected collections"
				outputComponents={['LineChart']}
				consistsOf={['CollectionSelector', 'FacetSearch']}
				currentInput={[
					'Search API: http://blofeld.beeldengeluid.nl:5320/api/v1',
					'Collectie IDs: nisv-catalogue-aggr, soundbites, mindoftheuniverse'
				]}
			/>
			<ComparativeSearch user="Component test user"
				collections={['nisv-catalogue-aggr', 'soundbites']}
				collectionSelector={true}/>
		</div>
	)
}

/*******************************************************************************
************************** Annotation components ******************************
*******************************************************************************/

function getCommentingForm(componentId, callback) {
	var CommentingForm = labo.CommentingForm;
	callback(componentId,
		<CommentingForm/>
	);
}

function getClassifyingForm(componentId, callback) {
	var ClassifyingForm = labo.ClassifyingForm;
	var config = {
		vocabularies : ["GTAA", "DBpedia", "UNESCO"]
	}
	callback(componentId,
		<ClassifyingForm config={config}/>
	);
}

function getLinkingForm(componentId, callback) {
	var LinkingForm = labo.LinkingForm;
	var config = {
		apis : [
			{"name" : "wikidata"},
			{"name" : "europeana"}
		]
	}
	callback(componentId,
		<LinkingForm config={config}/>
	);
}

/*******************************************************************************
************************** Play-out components ******************************
*******************************************************************************/

function getAnnotationPlayer(componentId, callback) {
	var FlexPlayer = labo.FlexPlayer;
	var mediaObject = {
		id : '0',
		url : 'https://www.youtube.com/watch?v=QF_qokjdsKY',
		mimeType : 'video/mp4'
	};
	var annotationSupport = {
		"currentQuery" : {
			"modes" : ["bookmark"]
		},
		"singleItem" : {
			"modes" : ["bookmark"]
		},
		"mediaObject" : {
			"modes" : ["classification", "comment", "link"]
		},
		"mediaSegment" : {
			"modes" : ["classification", "comment", "link"]
		},
		"annotation" : {
			"modes" : ["comment"]
		}
	};
	var annotationModes = {
		"classification" : {
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
	callback(componentId,
		<FlexPlayer
			user="Component test"
			annotationSupport={annotationSupport}
			annotationModes={annotationModes}
			mediaObject={mediaObject}
			active={true}/>
	);
}

function getVimeoPlayer(componentId, callback) {
	var VimeoPlayer = labo.VimeoPlayer;
	//https://vimeo.com/203174203
	var mediaObject = {
		id : '1',
		url : 'http://player.vimeo.com/video/203174203?api=1&amp;player_id=player_1',
		mimeType : 'video/mp4'
	};
	callback(componentId,
		<VimeoPlayer mediaObject={mediaObject}/>
	);
}

function getJWPlayer(componentId, callback) {
	var JWPlayer = labo.JWPlayer;
	var mediaObject = {
		id : '2',
		url : 'http://openbeelden.nl/files/49/49338.49323.WEEKNUMMER253-HRE00015701.mp4',
		mimeType : 'video/mp4'
	};
	callback(componentId,
		<JWPlayer mediaObject={mediaObject}/>
	);
}

function getYouTubePlayer(componentId, callback) {
	var YouTubePlayer = labo.YouTubePlayer;
	var mediaObject = {
		id : '3',
		url : 'https://www.youtube.com/watch?v=QF_qokjdsKY',
		mimeType : 'video/mp4'
	};
	callback(componentId,
		<YouTubePlayer mediaObject={mediaObject}/>
	);
}

function getImageViewer(componentId, callback) {
	var FlexImageViewer = labo.FlexImageViewer;
	var mediaObject = {
		url : 'http://hdl.handle.net/10744/mi_21cee277-cb55-415b-bef9-c27291090c9a',
		mimeType : 'image/jpeg'
	};
	return(
		<FlexImageViewer mediaObject={mediaObject} mediaObjectId="__mo_1"/>
	);
}

/*******************************************************************************
************************** Data visualisations ******************************
*******************************************************************************/

function getLineChart(componentId, callback) {
	var LineChart = labo.LineChart;
	var FlexComponentInfo = labo.FlexComponentInfo;
	callback(componentId,
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