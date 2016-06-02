var NISVCatalogueConfig = {
	getDocumentType: function() {
		return 'program_aggr';
	},

	getSearchableFields: function() {
		return [
			"bg:maintitles.bg:title",
			"bga:series.bg:maintitles.bg:title",
			"bg:publications.bg:publication.bg:broadcasters.bg:broadcaster",
			"bg:summary","bg:description"
		];
	},

	getFacets: function() {
		var ranges = TimeUtil.generateYearAggregationSK(1910, 2010);
		return [
			{
				field: 'bg:publications.bg:publication.bg:sortdate',
				title : 'Uitzenddatum',
				id : 'sortdate',
				operator : 'AND',
				size : 10,
				ranges: ranges//this yearly range is only for being able to draw the timeline
			},
			{
				field: 'bg:publications.bg:publication.bg:broadcasters.bg:broadcaster.raw',
				title : 'Broadcaster',
				id : 'broadcaster',
				operator : 'AND',
				size : 10
			},
			{
				field: 'bg:genres.bg:genre.raw',
				title : 'Genre',
				id : 'genre',
				operator : 'AND',
				size : 10
			},
			{
				field: 'bg:keywords.bg:keyword.raw',
				title : 'Keyword',
				id : 'keyword',
				operator : 'AND',
				size : 10
			}
		];
	},

	getDateFields: function() {
		return ['sortdate'];
	},

	getSearchHitClass: function() {
		return NISVCatalogueHit;
	}
}


// Search hit element definition
class NISVCatalogueHit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modalIsOpen: false
		};
	}

	formatSearchResults(result) {
		var parsedResult = {
			'title': "",
			"program_id": result['dc:identifier'],
			"description": "",
			"broadcast_date": "",
			"broadcaster": "",
			"genre": ""
		};

		//console.log(result);

		//console.log('getting title');
		if (result.hasOwnProperty('bg:maintitles') && result['bg:maintitles'].hasOwnProperty('bg:title')) {
			parsedResult.title = result['bg:maintitles']['bg:title'][0];
		}

		//console.log('getting summary');
		if (result.hasOwnProperty('bg:summary')) {
			parsedResult.description = result['bg:summary'];
		}

		//console.log('getting publication information');
		if (result.hasOwnProperty('bg:publications') && result['bg:publications'].hasOwnProperty('bg:publication')) {
			//console.log('getting publication date');
			if (result['bg:publications']['bg:publication'].hasOwnProperty('bg:sortdate')) {
				parsedResult.broadcast_date = result['bg:publications']['bg:publication']['bg:sortdate'];
			}
			//console.log('getting broadcaster');
			if (result['bg:publications']['bg:publication'].hasOwnProperty('bg:broadcasters')) {
				parsedResult.broadcaster = result['bg:publications']['bg:publication']['bg:broadcasters']['bg:broadcaster'];
			}
		}
		//console.log('getting genre');
		if (result.hasOwnProperty('bg:genres') && result['bg:genres'].hasOwnProperty('bg:genre')) {
			parsedResult.genre = result['bg:genres']['bg:genre'];
		}

		//console.log('returning result');
		return parsedResult;
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
					<span><strong>{result.title} ({result.broadcast_date})</strong></span><br/>
					<span>{result.broadcaster}</span><br/>
					<span>{result.genre}</span>
				</td></tr>
				</tbody></table>
			</div>
		);
	}
}