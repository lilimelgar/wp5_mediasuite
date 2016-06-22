/*
This component takes care of 'cooking the recipe'. It is important to know that the Recipe component
is not completely dumb (yet) and (still) contains logic for translating collectionIds into searchkit components.

So it means that the recipe itself is not completely agnostic (yet) of specific component logic. We should work on this
some more.

Necessary to improve / TODO:
1.

*/

class Recipe extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeBlocks: [],
			searchBlocks: [],
			queryOutputs: null,
			activeSearchTab: null
		};
		//console.debug(this.state.activeBlocks);
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
			collectionAPI.getCollectionStats(collectionId, function(data) {
				let b = this.state.searchBlocks;
				let ab = this.state.activeBlocks;
				b.push(this.createSearchBlock(data));
				ab.push(collectionId);
				this.setState({
        			searchBlocks: b,
        			activeBlocks: ab
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
			facets: facets,
			hitsComponent: config.getSearchHitClass()
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

	removeCollection(collectionId) {
		let b = this.state.searchBlocks;
		let ab = this.state.activeBlocks;
		let qops = this.state.queryOutputs;
		for(let i=b.length-1;i>=0;i--) {
			if(b[i].elementId == collectionId) {
				b.splice(i, 1);
				ab.splice(ab.indexOf(collectionId), 1);
				if(qops != null && qops[collectionId]) {
					delete qops[collectionId];
				}
			}
		}
		this.setState({
			searchBlocks : b,
			activeBlocks : ab
		})
	}

	onEditCollections(collectionId) {
		console.debug('Changing the collection: ' + collectionId);
		console.debug(this);
		this.loadCollections([collectionId]);
	}

	render() {
		//these are the buttons for toggling each UI block
		/*var blockAnchors = this.state.searchBlocks.map(function(searchBox) {
			return (
				<form key={searchBox.elementId}>
					<div className="checkbox">
						<label>
							<input type="checkbox" onChange={this.toggleMinimize.bind(this, searchBox.elementId)}/>
							Minimize {searchBox.elementId}
						</label>
					</div>
				</form>
			);
		}, this);*/

		var searchTabs = this.state.searchBlocks.map(function(searchBox) {
			if(this.state.activeBlocks.indexOf(searchBox.elementId) != -1) {
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
			}
		}, this)

		//these are the facet search UI blocks put into different tabs
		var searchTabContents = this.state.searchBlocks.map(function(searchBox) {
			if(this.state.activeBlocks.indexOf(searchBox.elementId) != -1) {
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
							hitsComponent={searchBox.hitsComponent}
						/>
					</div>
				);
			}
		}, this);

		var lineChart = null;
		if(this.props.ingredients.lineChart) {
			lineChart = <LineChart data={this.state.queryOutputs}/>;
		}

		var collectionSelector = null;
		if(this.props.ingredients.collectionSelector) {
			collectionSelector = <CollectionSelector onEditCollections={this.onEditCollections.bind(this)}/>
		}

		return (
			<div>
				{collectionSelector}
				{lineChart}
				<ul className="nav nav-tabs">
					{searchTabs}
				</ul>
				<div className="tab-content">
					{searchTabContents}
				</div>
			</div>
		);
	}
}