const SearchAPI = {

	search :function(collectionId, query, callback) {
		var url = _config.SEARCH_API_BASE + "/search/" + collectionId;
		console.debug(url);
		d3.xhr(url)
		.header("Content-Type", "application/json")
		.post(JSON.stringify(query), function(err, data){
			if(!err) {
				callback(JSON.parse(data.responseText));
			} else {
				callback(null);
			}
		});
	},

	getItemDetails :function(collectionId, itemId, callback) {
		var url = _config.SEARCH_API_BASE + '/document/get_doc/' + collectionId + '/' + itemId;
		console.debug(url);
		d3.xhr(url)
		.header("Content-Type", "application/json")
		.get(function(err, data) {
			if(!err) {
				callback(JSON.parse(data.responseText));
			} else {
				callback(null);
			}
		});
	}
}

export default SearchAPI;