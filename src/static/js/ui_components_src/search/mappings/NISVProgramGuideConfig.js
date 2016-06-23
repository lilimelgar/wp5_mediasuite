var NISVProgramGuideConfig = {
	getDocumentType: function() {
		return 'block';
	},

	getSearchableFields: function() {
		return [
			"block.text"
		];
	},

	getFacets: function() {
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
	},

	getDateFields: function() {
		return ['jaar'];
	},

	getSearchHitClass: function() {
		return NISVProgramGuideHit;
	}
}

// Search hit element definition
class NISVProgramGuideHit extends React.Component {
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
								<span>{result.text} ({result.broadcast_date})</span><br/>
								<span>{result.year}</span>
							</td>
						</tr>
					</tbody>
				</table>

				{this.state.showModal ? <ItemDetailsModal
					key='details_modal_program_guides'
					handleHideModal={this.handleHideModal.bind(this)}
					data={result}
					title={result.id}
				/> : null}

			</div>
		);
	}
}