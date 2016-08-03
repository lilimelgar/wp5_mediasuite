import CollectionSelector from './CollectionSelector';
import FacetSearchComponent from './FacetSearchComponent';
import FlexBox from './FlexBox';

class ComparativeSearch extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			collections : this.props.collections,
			activeCollection: this.props.collections.length > 0 ? this.props.collections[0] : null
		}
	}

	componentDidMount() {

	}

	/* ------------------------ COLLECTION CRUD --------------------- */

	removeCollection(collectionId) {
		let cs = this.state.collections;
		let index = cs.indexOf(collectionId);
		if(index != -1) {
			cs.splice(index, 1);
			this.setState({
				collections : cs,
				activeCollection : cs.length > 0 ? cs[0] : null
			});
		}
	}

	//TODO this function should never load a collection that has been already loaded
	onEditCollections(collectionId) {
		let cs = this.state.collections;
		if(cs.indexOf(collectionId) == -1) {
			cs.push(collectionId);
			this.setState({
				collections : cs,
				activeCollection : collectionId
			});
		}
	}

	/* ---------------------- OUTPUT COMMUNICATION ------------------- */

	//this function should be standard for any component that outputs data to the recipe
	onOutput(componentType, data) {
		this.props.onOutput(componentType, data);
	}

	render() {
		//for drawing the tabs
		var searchTabs = this.state.collections.map(function(c) {
			return (
				<li key={c + '__tab_option'}
					className={this.state.activeCollection == c ? 'active' : ''}>
					<a data-toggle="tab" href={'#' + c}>
						{c}
						<i className="glyphicon glyphicon-minus" onClick={this.removeCollection.bind(this, c)}></i>
					</a>
				</li>)
		}, this)

		//these are the facet search UI blocks put into different tabs
		var searchTabContents = this.state.collections.map(function(c) {
			return (
				<div key={c + '__tab_content'}
					id={c}
					className={this.state.activeCollection == c ? 'tab-pane active' : 'tab-pane'}>
					<h3>{c}</h3>
					<FacetSearchComponent key={c + '__sk'}
						collection={c}
						searchAPI={_config.SEARCH_API_BASE}
						onOutput={this.onOutput.bind(this)}/>
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