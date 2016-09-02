/*

SearchKit URLs:
	https://gitter.im/searchkit/searchkit
	https://blog.searchkit.co/searchkit-0-9-23d78568d219#.ng1zhfn5u

TODO
1. I created an feature request in the SearchKit GitHub for dealing with persisting the state of multiple SK queries in the URL
	so let's see how to deal with this. We probably should implement our own way of persisting multiple queries via URLs so
	it is possible to use this for many different components
2. There are many ugly things such as the paging component and the facet boxes that should be styled really well
3. When used 1 time in a page, this component is fine, but with more there are several annoying things (related to styling and the
	focus traversal pattern between the input boxes that needs to be fixed)
4. SearchKit does not yet support date related facets, the SK guys are working on this. For now I've hidden date related facets
	- UPDATE: try out this new filter for dates https://github.com/GregoryPotdevin/searchkit-daterangefilter
5. more stuff

*/

import React from 'react';
import CollectionAPI from '../../api/CollectionAPI';
import CollectionUtil from '../../util/CollectionUtil';
import FlexHits from './FlexHits';

import {
    Hits,
	NoHits,
	HitsStats,
	SearchkitProvider,
	SearchBox,
	SearchkitManager,
	InitialLoader,
	Pagination,
	PaginationSelect,
	PageSizeSelector,
	Select,
	RefinementListFilter,
	NumericRefinementListFilter
} from "searchkit";

const NumericRefinementOption = (props) => (
	<div className="invisible">

	</div>
 )

//COMPONENT OUTPUT: the results of each query => {collectionId, results, dateField}
class FacetSearchComponent extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			collectionConfig : null,
			displayFacets: false
		};
		this.init();
	}

	/* ------------------------ GENERATING DATA FOR THE SEARCH TABS --------------------- */

	init() {
  		CollectionAPI.getCollectionStats(this.props.collection, function(data) {
  			let collectionConfig = this.generateCollectionConfig(data);
  			this.setState(
  				{
	  				collectionConfig: collectionConfig,
	  				displayFacets: collectionConfig.facets ? true : false
	  			},
	  			this.initSearchKit()//init the searchkit after the collectionConfig has been loaded
	  		);
  		}.bind(this));
	}

	generateCollectionConfig(stats) {
		let config = CollectionUtil.determineConfig(stats.service.collection);
		let docType = CollectionUtil.determineDocType(stats, config);
		let searchableFields = CollectionUtil.determineSearchableFields(stats, config);
		let dateFields = CollectionUtil.determineDateFields(stats, config);
		let facets = CollectionUtil.determineFacets(dateFields, config);
		return {//TODO optimize this later so most things are passed via the config, i.e. collection mapping
			collectionId : stats.service.collection,
			dateFields: dateFields,
			prefixQueryFields: searchableFields,
			facets: facets,
			sourceFilter: config.getSnippetFields()
		}
	}

	initSearchKit() {
		this.skInstance = new SearchkitManager(this.props.searchAPI, {
			searchUrlPath: '/search/' + this.props.collection,
			useHistory: false,
			searchOnLoad: false
		});

		//now this function is triggered for the linechart only, but it can be any function in the recipe.
		if(this.props.onOutput) {
			let removalFn = this.skInstance.addResultsListener((results)=> {
		  		setTimeout(function() {
		  			//this propagates the query output back to the recipe, who will delegate it further to any configured visualisation
		  			this.props.onOutput('facet-search', {
						collectionId : this.props.collection, //currently this is the same as the collection ID in the collection API
						results : results, //the results of the query that was last issued
						dateField : this.state.collectionConfig.dateFields[0] //the currently selected datafield (TODO this is currently defined in the collection config)
					});
		  		}.bind(this), 1000);
			});
		}

		//this is currently default
		this.skInstance.translateFunction = (key)=> {
			return {"pagination.next": ">", "pagination.previous": "<"}[key]
		}
	}

	toggleFacets() {
		this.setState({displayFacets: !this.state.displayFacets});
	}

	render() {
		var filterBlocks = null;
		var facetSearch = null;

		//only render when there is a collectionConfig available
		if(this.state.collectionConfig) {

			if(this.state.collectionConfig.facets) {
				filterBlocks = this.state.collectionConfig.facets.map(function(facet) {
					if(!facet.ranges) {
						return (
							<RefinementListFilter
								key={facet.id + '__facet'}
								field={facet.field}
								title={facet.title}
								id={facet.id}
								operator={facet.operator}
								size={facet.size}
								/>
						);
					} else {
						//TODO this bit has to be replaced with a daterangefilter whenever searchkit releases that
						return (
							//<DynamicRangeFilter field={facet.field} id={facet.id} title={facet.title}/>

							<NumericRefinementListFilter
								key={facet.id + '__facet'}
								field={facet.field}
								title={facet.title}
								id={facet.id}
								size={facet.size}
								options={facet.ranges}
								itemComponent={NumericRefinementOption}
								/>
						);
					}
				}, this);
			}

			facetSearch = (
				<SearchkitProvider searchkit={this.skInstance}>
					<div className={this.state.minimized ? 'hidden' : ''}>

						<div className="row">
							<div className="col-md-12">
								<SearchBox
									autofocus={true}
									searchOnChange={false}
									//searchThrottleTime={400}
									prefixQueryFields={this.state.collectionConfig.prefixQueryFields}
									/>
							</div>
						</div>

						<div className="row">

							<div className="col-md-3">
								<HitsStats/>
							</div>

							<div className="col-md-3">
								<form>
									<div className="checkbox">
										<label>
											<input type="checkbox" onChange={this.toggleFacets.bind(this)}/> Filter results
										</label>
		  							</div>
								</form>
							</div>

							<div className="col-md-3">
								<PageSizeSelector options={[10,20,50]} listComponent={Select} />
							</div>

						</div>

						<div className="row sk-layout__body">


							<div className={this.state.displayFacets ? '' : 'hidden'}>
								{filterBlocks}
							</div>


							<div className="sk-layout__results sk-results-list">
								<div className="sk-result_action-bar sk-action-bar">
									<Hits
										hitsPerPage={10}
										itemComponent={
											<FlexHits
												collection={this.props.collection}
												itemDetailsRecipe={this.props.itemDetailsRecipe}
											/>
										}
										//sourceFilter={this.props.sourceFilter}
									/>

									<NoHits translations={{
										 "NoHits.NoResultsFound":"No results found were found for {query}",
										 "NoHits.DidYouMean":"Search for {suggestion}",
										 "NoHits.SearchWithoutFilters":"Search for {query} without filters"
									}}/>
									<InitialLoader/>
								</div>
							</div>

						</div>

						<div className="row">
							<div className="col-md-12">
								<Pagination showNumbers={true}/>
							</div>
						</div>

					</div>
				</SearchkitProvider>
			)
		}

		return (
			<div>
				{facetSearch}
			</div>
		);
	}
}

export default FacetSearchComponent;