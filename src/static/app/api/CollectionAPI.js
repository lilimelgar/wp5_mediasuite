//var d3 = require("d3");

const CollectionAPI = {

	getCollectionStats: function(collectionId, callback) {
	    var url = _config.SEARCH_API_BASE + "/collections/show_stats?collectionId=" + collectionId;
	    d3.json(url, function(error, data) {
	        callback(data);
	    });
	},

	listCollections: function(callback) {
		console.debug('getting collections');
	    var url = _config.SEARCH_API_BASE  + "/collections/list_collections";
	    d3.json(url, function(error, data) {
	        callback(data);
	    });
	}
}

export default CollectionAPI;