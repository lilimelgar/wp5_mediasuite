import SearchAPI from '../../api/SearchAPI';
import CollectionSelector from '../collection/CollectionSelector';
import FacetSearchComponent from './FacetSearchComponent';
import FlexBox from '../FlexBox';
import AnnotationUtil from '../../util/AnnotationUtil'

class ComparativeSearch extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			user : this.props.user,
			collections : this.props.collections,
			activeCollection: this.props.collections.length > 0 ? this.props.collections[0] : null,
			currentOutput: null, //could also be a default state value for components which implement onOutput
			annotationTarget : null //only if there is annotationSupport and only for classify, comment & link
		}
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

	/* ----------------------- FOR ANNOTATION SUPPORT (candidates for utility or super class)----- */

	//this function should check if the annotation support is relevant for itself
	hasAnnotationSupport() {
		if(this.props.annotationSupport != null) {
			if(this.props.annotationSupport.currentQuery || this.props.annotationSupport.singleItem) {
				return true;
			}
		}
		return false;
	}

	/* ------------------------------------------------------------------------------
	------------------------------- COMMUNICATION WITH OWNER/RECIPE -----------------
	------------------------------------------------------------------------------- */

	onOutput(componentClass, data) {
		//passes along the output to the owner (if specified in the props)
		if(this.props.onOutput) {
			this.props.onOutput(componentClass, data);
		}
		//stores the current output of the last search in the state (for bookmarking)
		if(componentClass == 'FacetSearchComponent') {
			this.setState({currentOutput: data});
		}
	}

		//connected to the onOutput of the CollectionSelector
	onComponentOutput(componentClass, collectionId) {
		if(componentClass == 'CollectionSelector') {
			let cs = this.state.collections;
			if(cs.indexOf(collectionId) == -1) {
				cs.push(collectionId);
				this.setState({
					collections : cs,
					activeCollection : collectionId
				});
			}
		}
	}

	//TODO assign the current media Object as target
	setActiveAnnotationTarget(annotationTarget) {
		if(this.props.setActiveAnnotationTarget) {
			this.props.setActiveAnnotationTarget(annotationTarget);
		}
	}

	//TODO this should 'play' props.playingAnnotation
	playAnnotation(annotation) {
		console.debug('to be implemented: playAnnotation()');
	}

	/* ---------------------- RENDER ------------------- */

	render() {
		let collectionSelector = null;
		let annotationTestButtons = null;
		//for drawing the tabs
		const searchTabs = this.state.collections.map(function(c) {
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
		const searchTabContents = this.state.collections.map(function(c) {
			return (
				<div key={c + '__tab_content'}
					id={c}
					className={this.state.activeCollection == c ? 'tab-pane active' : 'tab-pane'}>
					<h3>{c}</h3>
					<FacetSearchComponent key={c + '__sk'}
						user={this.props.user}
						collection={c}
						searchAPI={_config.SEARCH_API_BASE}
						onOutput={this.onOutput.bind(this)}
						itemDetailsRecipe={this.props.itemDetailsRecipe}
						annotationSupport={this.props.annotationSupport}
						/>
				</div>
				);
		}, this);

		//only show if configured
		if(this.props.collectionSelector === true) {
			collectionSelector = <CollectionSelector onOutput={this.onComponentOutput.bind(this)} showStats={false}/>;
		}

		//only show if configured
		if(this.hasAnnotationSupport()) {
			let annotation = AnnotationUtil.generateW3CEmptyAnnotation(
					this.props.user,
					'http://data.beng.nl/avresearcherxl',
					'text/plain'
				);
			annotationTestButtons = (
				<div>
					<button type="button" className="btn btn-default"
						onClick={this.props.editAnnotation.bind(this, annotation)}>
						Annotate test
					</button>
					<br/>
					<br/>
				</div>
			)
		}

		return (
			<div>
				<div className="row">
					<div className="col-md-12">
						{annotationTestButtons}
						{collectionSelector}
						<br/>
						<ul className="nav nav-tabs">
							{searchTabs}
						</ul>
						<div className="tab-content">
							{searchTabContents}
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default ComparativeSearch;