import React from 'react';
import TimeUtil from '../../util/TimeUtil.js';
import CollectionUtil from '../../util/CollectionUtil.js';
import CollectionDataUtil from '../../util/CollectionDataUtil.js';
import FlexModal from '../../components/FlexModal.jsx';
import SearchResult from '../../components/SearchResult.jsx';
import ItemDetails from '../../components/ItemDetails.jsx';

//base class for each collection configuration
export class CollectionConfig {
	constructor(){}

	getDocumentType() {return null;}

	getSearchableFields() {return null;}

	getDateFields() {return null;}

	getFacets() {return null;}

	getSearchHitClass() {return CollectionHit;}

	getItemDetailData(result) {
		return CollectionDataUtil.extractStructuredData(result);
	}

	getResultSnippetData(result) {
		return {
			title: result.title,
			date: result.date
		}
	}
}

//base class for a each collection specific SearchKit Hit within the FacetSearchComponent
export class CollectionHit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modalIsOpen: false,
			config: CollectionUtil.determineConfig('__default__')
		};
	}

	handleShowModal() {
		this.setState({showModal: true})
	}

	handleHideModal() {
		this.setState({showModal: false})
	}

	render() {
		let result = this.state.config.getItemDetailData(this.props.result);
		console.debug(result);
		let snippet = this.state.config.getResultSnippetData(result);
		return (
			<div
				className={this.props.bemBlocks.item().mix(this.props.bemBlocks.container("item"))}
				key={result.id}
				onClick={this.handleShowModal.bind(this)}
			>
				<SearchResult data={snippet}/>

				{this.state.showModal ?
					<FlexModal
						key={result.id + '__modal'}
						handleHideModal={this.handleHideModal.bind(this)}
						title={result.id}>
						<ItemDetails data={result}/>
					</FlexModal>: null
				}
			</div>
		);
	}
}