import React from 'react';
import TimeUtil from '../../util/TimeUtil.js';
import CollectionUtil from '../../util/CollectionUtil.js';
import FlexModal from '../../components/FlexModal.jsx';
import {CollectionConfig} from './CollectionConfig.jsx';
import SearchResult from '../../components/SearchResult.jsx';
import ItemDetails from '../../components/ItemDetails.jsx';

export class NISVProgramGuideConfig extends CollectionConfig {
	constructor() {
		super();
	}

	getDocumentType() {
		return 'block';
	}

	getSearchableFields() {
		return ["block.text"];
	}

	getFacets() {
		var ranges = TimeUtil.generateYearAggregationSK(1910, 2010);
		return [
			{
				field: 'guideId',
				title: 'Omroep',
				id: 'broadcaster',
				operator: 'AND',
				size:10
			},
			{
				field: 'blockType',
				title: 'Type blok',
				id: 'blockType',
				operator: 'AND',
				size:10
			},
			{
				field: 'year',
				title: 'Jaar',
				id: 'jaar',
				size:10,
				ranges: ranges

			}
		];
	}

	getDateFields() {
		return ['jaar'];
	}

	getSearchHitClass() {
		return NISVProgramGuideHit;
	}

	getItemDetailData(result) {
		return result;
	}

	getResultSnippetData(result) {
		return {
			id: result.id,
			text: result.text,
			broadcastDate: result.broadcast_date,
			year: result.year
		}

	}
}

// Search hit element definition
export class NISVProgramGuideHit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showModal : false,
			config: CollectionUtil.determineConfig('nisv_programguides')
		};
	}

	formatSearchResults(result) {
		return result
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
					</FlexModal> : null
				}

			</div>
		);
	}
}