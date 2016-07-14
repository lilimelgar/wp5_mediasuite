import React from 'react';
import CollectionUtil from '../util/CollectionUtil.js';
import FlexModal from './FlexModal.jsx';
import SearchResult from './SearchResult.jsx';
import ItemDetails from './ItemDetails.jsx';

class FlexHits extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showModal : false,
			config: CollectionUtil.determineConfig(this.props.collectionId)
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

export default FlexHits;