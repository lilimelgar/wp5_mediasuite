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
5. more stuff

*/

import * as React from 'react';
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

//overwrites the default loading component
const InitialLoaderComponent = (props) => (
	<div className="item">
		loading, please wait...
	</div>
);

//TODO this is a temporary trick to remove the year facet from view
const NumericRefinementOption = (props) => (
	<div className="invisible">

	</div>
)

//the CLARIAH facet search component
class FacetSearchComponent extends React.Component {
	constructor(props) {
		super(props);
		this.initSearchKit();
		this.state = {
			displayFacets: this.props.facets ? true : false,
			collectionId: this.props.blockId
		};
	}

	initSearchKit() {
		this.skInstance = new SearchkitManager(this.props.searchAPI, {
			searchUrlPath: this.props.indexPath,
			useHistory: false,
			searchOnLoad: false
		});

		//update the lineChart after receiving each new search result (TODO check for the existence of a lineChart etc)
		let removalFn = this.skInstance.addResultsListener((results)=> {
	  		setTimeout(function() {
	  			this.updateLineChart(results)
	  		}.bind(this), 1000);
		})

		//this is currently default
		this.skInstance.translateFunction = (key)=> {
			return {"pagination.next": ">", "pagination.previous": "<"}[key]
		}
	}

	//this propagates the query output back to the recipe, who will delegate it further to any configured visualisation
	updateLineChart(queryResults) {
		this.props.onQueryOutput(
			this.props.blockId, //currently this is the same as the collection ID in the collection API
			queryResults, //the results of the query that was last issued
			this.props.dateFields[0] //the currently selected datafield (TODO this is currently defined in the collection config)
		);
	}

	toggleFacets() {
		this.setState({displayFacets: !this.state.displayFacets});
	}

	render() {
		var filterBlocks = '';
		if(this.props.facets) {
			filterBlocks = this.props.facets.map(function(facet) {
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

		return (
			<SearchkitProvider searchkit={this.skInstance}>
				<div className={this.state.minimized ? 'hidden' : ''}>

					<div className="search-box">
						<SearchBox
							autofocus={true}
							searchOnChange={true}
							prefixQueryFields={this.props.prefixQueryFields}
							/>
					</div>

					<div>
						<HitsStats/>

						<form>
							<div className="checkbox">
								<label>
									<input type="checkbox" onChange={this.toggleFacets.bind(this)}/> Filter results
								</label>
  							</div>
						</form>

						Results per page: <PageSizeSelector options={[10,20,50]} listComponent={Select} />
					</div>

					<div className="sk-layout__body">


						<div className={this.state.displayFacets ? '' : 'hidden'}>
							{filterBlocks}
						</div>


						<div className="sk-layout__results sk-results-list">
							<div className="sk-result_action-bar sk-action-bar">
								<Hits hitsPerPage={10} itemComponent={<FlexHits collectionId={this.props.blockId}/>}/>

								<NoHits translations={{
									 "NoHits.NoResultsFound":"No results found were found for {query}",
									 "NoHits.DidYouMean":"Search for {suggestion}",
									 "NoHits.SearchWithoutFilters":"Search for {query} without filters"
								}}/>
								<InitialLoader component={InitialLoaderComponent} />
							</div>
						</div>

					</div>

					<Pagination showNumbers={true}/>

				</div>
			</SearchkitProvider>
		);
	}
}

export default FacetSearchComponent;