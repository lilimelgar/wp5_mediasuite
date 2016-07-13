import React from 'react';
import TimeUtil from '../../util/TimeUtil.js';
import ItemDetailsModal from '../../components/ItemDetailsModal.jsx'

export const SpeechAndernieuwsConfig = {
	getDocumentType: function() {
		return 'asr_chunk';
	},

	getSearchableFields: function() {
		return [
			"words"
		];
	},

	getFacets: function() {
		var ranges = TimeUtil.generateYearAggregationSK(1910, 2010);
		return [
			{
				field: 'keywords.word',
				title : 'Keyword',
				id : 'keyword',
				operator : 'AND',
				size : 10
			}
		];
	},

	getDateFields: function() {
		return ['metadata.broadcast_date'];
	},

	getSearchHitClass: function() {
		return SpeechAndernieuwsHit;
	}
}


// Search hit element definition
export class SpeechAndernieuwsHit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showModal : false
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
		const result = this.formatSearchResults(this.props.result);
		var resultDetails = Object.keys(result).map((key)=> {
			return (<span><strong>{key}:</strong>{result[key]}<br/></span>)
		});
		return (
			<div
				className={this.props.bemBlocks.item().mix(this.props.bemBlocks.container("item"))}
				key={result.id}
				onClick={this.handleShowModal.bind(this)}
			>
				<table>
					<tbody>
						<tr>
							<td>
								<span>{result.id}</span><br/>
								<span>{result.words}</span><br/>
								<span>{result.asr_file}</span>
							</td>
						</tr>
					</tbody>
				</table>

				{this.state.showModal ? <ItemDetailsModal
					key='details_modal_speech_andernieuws'
					handleHideModal={this.handleHideModal.bind(this)}
					data={result}
					title={result.id}
				/> : null}

			</div>
		);
	}
}