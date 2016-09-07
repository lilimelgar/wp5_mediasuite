//this function is attached to the window, so it is made accessible within the scope of the HTML page
function showComponent(componentId) {
	var FlexBox = clariah.FlexBox;
	var component = null;

	switch(componentId) {
		case 'Collection analyser': component = getCollectionAnalyser();break;
		case 'Collection selector': component = getCollectionSelector();break;
		case 'Named query selector' : component = getNamedQuerySelector();break;

		case 'Facet search': component = getFacetSearch();break;
		case 'Comparative search': component = getComparativeSearch();break;

		case 'Commenting' : component = getCommentingForm();break;
		case 'Classifying' : component = getClassifyingForm();break;
		case 'Linking' : component = getLinkingForm();break;

		case 'Segmenting player': component = getAnnotationPlayer();break;
		case 'JWPlayer': component = getJWPlayer();break;
		case 'Vimeo player': component = getVimeoPlayer();break;
		case 'YouTube player': component = getYouTubePlayer();break;

		case 'Image viewer': component = getImageViewer();break;

		case 'Line chart': component = getLineChart();break;
	}

	if(component) {
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

function getCollectionSelector() {
	var CollectionSelector = clariah.CollectionSelector;
	return (
		<CollectionSelector/>
	)
}

function getNamedQuerySelector() {
	var NamedQuerySelector = clariah.NamedQuerySelector;
	return (
		<NamedQuerySelector/>
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
		<FacetSearchComponent collection="labs-catalogue-aggr" searchAPI={_config.SEARCH_API_BASE}/>
	);
}

function getComparativeSearch() {
	var ComparativeSearch = clariah.ComparativeSearch;
	return (
		<ComparativeSearch user="Component test user"
			collections={['labs-catalogue-aggr', 'spraak__andernieuws', 'soundbites']}
			collectionSelector={true}/>
	)
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
	var mediaObject = {
		url : 'http://os-immix-w/bascollectie/LEKKERLEZEN__-HRE000554F5_63070000_63839000.mp4',
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
	var mediaObject = {
		url : 'http://player.vimeo.com/video/176894130?api=1&amp;player_id=player_1',
		mimeType : 'video/mp4'
	};
	return (
		<VimeoPlayer mediaObject={mediaObject}/>
	);
}

function getJWPlayer() {
	var JWPlayer = clariah.JWPlayer;
	var mediaObject = {
		url : 'http://os-immix-w/bascollectie/LEKKERLEZEN__-HRE000554F5_63070000_63839000.mp4',
		mimeType : 'video/mp4'
	};
	return (
		<JWPlayer mediaObject={mediaObject}/>
	);
}

function getYouTubePlayer() {
	var YouTubePlayer = clariah.YouTubePlayer;
	var mediaObject = {
		url : 'https://www.youtube.com/watch?v=eZCvMpPM2SY',
		mimeType : 'video/mp4'
	};
	return (
		<YouTubePlayer mediaObject={mediaObject}/>
	);
}

function getImageViewer() {
	var FlexImageViewer = clariah.FlexImageViewer;
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
