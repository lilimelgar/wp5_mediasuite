import FacetSearchComponent from './FacetSearchComponent';
import FlexBox from './FlexBox';
import CollectionAPI from '../api/CollectionAPI';
import CollectionUtil from '../util/CollectionUtil';

class ComparativeSearch extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			activeCollections : this.props.collections,
			searchBlocks: [],//holds the FacetSearchComponents that are currently on the screen
			activeSearchTab: null //add the active collections
		}
	}

	componentDidMount() {
		this.loadCollections(this.props.collections);
	}

	/* ------------------------ GENERATING DATA FOR THE SEARCH TABS --------------------- */

	loadCollections(collectionIds) {
		for(let i=0;i<collectionIds.length;i++) {
	  		let collectionId = collectionIds[i];
	  		CollectionAPI.getCollectionStats(collectionId, function(data) {
	  			let b = this.state.searchBlocks;
	  			b.push(this.createSearchBlock(data));
	  			this.setState({
	  				searchBlocks: b
	  			});
	  			if(b && b.length > 0) {
	  				this.setState({
	  					activeSearchTab: b[0].collectionId
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
			collectionId : stats.service.collection,
			dateFields: dateFields,
			prefixQueryFields: searchableFields,
			facets: facets,
			sourceFilter: config.getSnippetFields()
		}
		return block;
	}

	/* ------------------------ COLLECTION CRUD --------------------- */

	removeCollection(collectionId) {
		let b = this.state.searchBlocks;
		let qops = this.state.queryOutputs;
		for(let i=b.length-1;i>=0;i--) {
			if(b[i].collectionId == collectionId) {
				b.splice(i, 1);
				if(qops != null && qops[collectionId]) {
					delete qops[collectionId];
				}
			}
		}
	  	this.setState({
			searchBlocks : b,
			queryOutputs : qops
		})
	}

	//TODO this function should never load a collection that has been already loaded
	onEditCollections(collectionId) {
		this.loadCollections([collectionId]);
	}

	/* ---------------------- OUTPUT COMMUNICATION ------------------- */

	//this function should be standard for any component that outputs data to the recipe
	onOutput(componentType, data) {
		this.props.onOutput(componentType, data);
	}

	render() {
		//for drawing the tabs
		var searchTabs = this.state.searchBlocks.map(function(searchBox) {
			return (
				<li key={searchBox.collectionId + '__tab_option'} className={
					this.state.activeSearchTab == searchBox.collectionId ? 'active' : ''
				}><a data-toggle="tab" href={'#' + searchBox.collectionId}>
				{searchBox.collectionId}
				<i className="glyphicon glyphicon-minus" onClick={
					() => (this.removeCollection(searchBox.collectionId))
				}></i>
				</a></li>
				)
		}, this)

		//these are the facet search UI blocks put into different tabs
		var searchTabContents = this.state.searchBlocks.map(function(searchBox) {
			return (
				<div
					key={searchBox.collectionId + '__tab_content'}
					id={searchBox.collectionId}
					className={this.state.activeSearchTab == searchBox.collectionId ? 'tab-pane active' : 'tab-pane'}
				>
					<h3>{searchBox.collectionId}</h3>
					<FacetSearchComponent
						key={searchBox.collectionId + '__sk'}
						collectionId={searchBox.collectionId}
						searchAPI={_config.SEARCH_API_BASE}
						indexPath={'/search/' + searchBox.collectionId}
						onOutput={this.onOutput.bind(this)}
						prefixQueryFields={searchBox.prefixQueryFields}
						dateFields={searchBox.dateFields}
						facets={searchBox.facets}
						sourceFilter={searchBox.sourceFilter}
					/>
				</div>
				);
		}, this);

		var collectionSelector = null;
		if(this.props.collectionSelector === true) {
			collectionSelector = <FlexBox><CollectionSelector onEditCollections={this.onEditCollections.bind(this)}/></FlexBox>;
		}

		return (
			<div>
				{collectionSelector}
				<FlexBox>
					<ul className="nav nav-tabs">
						{searchTabs}
					</ul>
					<div className="tab-content">
						{searchTabContents}
					</div>
				</FlexBox>
			</div>
		)
	}
}

export default ComparativeSearch;