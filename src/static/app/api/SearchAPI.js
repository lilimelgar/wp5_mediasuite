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
	}
}

export default SearchAPI;