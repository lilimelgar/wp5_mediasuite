var collectionAPI = {

	getCollectionStats :function(collectionId, callback) {
	    var url = _config.SEARCH_API_BASE + "/collections/show_stats?collectionId=" + collectionId;
	    d3.json(url, function(error, data) {
	        callback(data);
	    });
	}
}
