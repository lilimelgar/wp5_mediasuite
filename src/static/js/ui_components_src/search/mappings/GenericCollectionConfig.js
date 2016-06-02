var GenericCollectionConfig = {
	getDocumentType: function() {
		return null;
	},

	getSearchableFields: function() {
		return null;
	},

	getFacets: function() {
		return null;
	},

	getSearchHitClass: function() {
		return GenericCollectionHit;
	},

	getDateFields: function() {
		return null;
	}
}

class GenericCollectionHit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modalIsOpen: false
		};
	}

	isPossibleTitle(key) {
		return key.indexOf('title') != -1 || key.indexOf('titel') != -1;
	}

	formatSearchResults(result) {
		var parsedResult = {
			title: 'unknown title'
		}
		for(var key in result) {
			if(this.isPossibleTitle(key)) {
				parsedResult.title = result[key];
			}
		}
		return parsedResult;
	}

	render() {
		const result = this.formatSearchResults(this.props.result);
		return (
			<div className={this.props.bemBlocks.item().mix(this.props.bemBlocks.container("item"))}>
			<table><tbody>
			<tr><td>
				<span>{result.title}</span>
			</td></tr>
			</tbody></table>
			</div>
		);
	}
}