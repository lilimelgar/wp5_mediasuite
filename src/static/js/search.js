
var parseSearchHit = function(result) {
	parsedResult = {
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
