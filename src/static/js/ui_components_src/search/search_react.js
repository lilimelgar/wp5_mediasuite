const host = "http://blofeld.beeldengeluid.nl:5320/api/v1"
const sk = new Searchkit.SearchkitManager(host, {
	searchUrlPath: "/search/labs-catalogue-aggr"
});

sk.translateFunction = (key)=> {
	return {"pagination.next": "Next Page", "pagination.previous": "Previous Page"}[key]
}

// Load searchkit modules
const Hits = Searchkit.Hits
const NoHits = Searchkit.NoHits
const HitsStats = Searchkit.HitsStats;

// styling objects for React elements
var searchboxStyle = {
	padding: '10px',
	borderRadius: '4px',
	border: '1px solid dodgerblue',
	backgroundColor: 'white'
};

var layoutStyle = {
	backgroundColor: 'white'
};

var layoutBodyStyle = {
	margin: '5px'
};

var filterStyle = {
	boxShadow: 'none',
	padding: '0px',
	margin: '0px',
	color: 'dodgerblue'
}

var resultsStyle = {
	boxShadow: 'none'
}

var hitStyle = {
	margin: '5px',
	padding: '10px',
	border: '1px solid dodgerblue',
	borderRadius: '4px'
};

var pagingStyle = {

};

// Search hit element definition
class CatalogueHit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modalIsOpen: false
		};
	};

	render() {
		const result = parseSearchHit(this.props.result);
		return (
			<div className={this.props.bemBlocks.item()} key={result.program_id} style={hitStyle} >
			<table><tbody>
			<tr><td>
				<span className={this.props.bemBlocks.item("title")}>{result.title} ({result.broadcast_date})</span><br/>
				<span className="authors">{result.broadcaster}</span><br/>
				<span className="genre">{result.genre}</span>
				<span className="genre">{result.description}</span>
			</td></tr>
			</tbody></table>
			</div>
		);
	}
}


const InitialLoaderComponent = (props) => (
	<div className="item">
		loading, please wait...
	</div>
);

class Application extends React.Component {
	render() {
		const SearchkitProvider = Searchkit.SearchkitProvider;
		const Searchbox = Searchkit.SearchBox;
		const InitialLoader = Searchkit.InitialLoader;
		const Pagination = Searchkit.Pagination;
		const PageSizeSelector = Searchkit.PageSizeSelector;
		const Toggle = Searchkit.Toggle;
		const Select = Searchkit.Select;
		const RangeFilter = Searchkit.RangeFilter;
		const RefinementListFilter = Searchkit.RefinementListFilter;
		return (<div>

			<SearchkitProvider searchkit={this.props.skInstance}>
				<div className="sk-layout" style={layoutStyle}>

					<div className="navbar-inverse" style={searchboxStyle}>
						<Searchbox
							autofocus={true}
							searchOnChange={true}
							prefixQueryFields={["bg:maintitles.bg:title","bga:series.bg:maintitles.bg:title","bg:publications.bg:publication.bg:broadcasters.bg:broadcaster","bg:summary","bg:description"]}
							/>
					</div>

					<div className="sk-layout__body" style={layoutBodyStyle}>

						<div className="sk-layout__filters" style={filterStyle}>
							<RefinementListFilter
								field="bg:publications.bg:publication.bg:broadcasters.bg:broadcaster.raw"
								title="Broadcaster" id="broadcaster"
								operator="AND"
								size={10} />
							<RefinementListFilter
								field="bg:genres.bg:genre.raw"
								title="Genres" id="genre"
								operator="AND"
								size={10} />
							<RefinementListFilter
								field="bg:keywords.bg:keyword.raw"
								title="Keywords"
								id="keyword"
								operator="AND"
								size={10} />
						</div>


						<div className="sk-layout__results sk-results-list" style={resultsStyle}>
							<div className="sk-result_action-bar sk-action-bar">
								<div className="sk-action_bar__info">
									<HitsStats/>
									Results per page: <PageSizeSelector options={[10,20,50]} listComponent={Select} />
								</div>
								<Hits hitsPerPage={10} itemComponent={CatalogueHit}/>
								<NoHits translations={{
									 "NoHits.NoResultsFound":"No results found were found for {query}",
									 "NoHits.DidYouMean":"Search for {suggestion}",
									 "NoHits.SearchWithoutFilters":"Search for {query} without filters"
								}} suggestionsField="bg:description"/>
								<InitialLoader component={InitialLoaderComponent} />
								<Pagination showNumbers={true}/>
							</div>
						</div>
					</div>
				</div>
			</SearchkitProvider>

		</div>);
	}
}

ReactDOM.render(<Application skInstance={sk}/>, document.getElementById('app'));
