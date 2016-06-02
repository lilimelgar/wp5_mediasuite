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
			modalIsOpen: false
		};
	}

	formatSearchResults(result) {
		return result
	}

	render() {
		const result = this.formatSearchResults(this.props.result);
		return (
			<div
				className={this.props.bemBlocks.item().mix(this.props.bemBlocks.container("item"))}
				key={result.program_id}
			>
			<table><tbody>
			<tr><td>
				<span>{result.text} ({result.broadcast_date})</span><br/>
				<span>{result.year}</span>
			</td></tr>
			</tbody></table>
			</div>
		);
	}
}