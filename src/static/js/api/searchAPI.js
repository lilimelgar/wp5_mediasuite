//http://stackoverflow.com/questions/14970578/how-do-i-post-parameter-on-d3-json

/*
{"query":
	{"bool":{"should":[{"simple_query_string":{"query":"amst","fields":["_all"]}},
	{"multi_match":
	{"query":"amst","type":"phrase_prefix",
	"fields":["bg:maintitles.bg:title","bga:series.bg:maintitles.bg:title","bg:publications.bg:publication.bg:broadcasters.bg:broadcaster","bg:summary","bg:description"]}}]}},

	"aggs":{"sortdate":{"filter":{},
	"aggs":{"sortdate":{"range":{"field":"bg:publications.bg:publication.bg:sortdate",
	"ranges":[{"key":"All"},{"key":"1950 - 1960","from":-628477200000,"to":-312944400000},
	{"key":"1960 - 1970","from":-312944400000,"to":2674800000},
	{"key":"1970 - 1980","from":2674800000,"to":318207600000},
	{"key":"1980 - 1990","from":318207600000,"to":633826800000},
	{"key":"1990 - 2000","from":633826800000,"to":949359600000},
	{"key":"2000 - 2010","from":949359600000,"to":1264978800000},
	{"key":"2010 - 2020","from":1264978800000,"to":1580511600000}]}}}},
	"bg:publications.bg:publication.bg:broadcasters.bg:broadcaster.raw4":{"filter":{},
	"aggs":{"bg:publications.bg:publication.bg:broadcasters.bg:broadcaster.raw":
	{"terms":{"field":"bg:publications.bg:publication.bg:broadcasters.bg:broadcaster.raw","size":10}},
	"bg:publications.bg:publication.bg:broadcasters.bg:broadcaster.raw_count":
	{"cardinality":{"field":"bg:publications.bg:publication.bg:broadcasters.bg:broadcaster.raw"}}}},
	"bg:genres.bg:genre.raw5":{"filter":{},"aggs":{"bg:genres.bg:genre.raw":
	{"terms":{"field":"bg:genres.bg:genre.raw","size":10}},
	"bg:genres.bg:genre.raw_count":{"cardinality":{"field":"bg:genres.bg:genre.raw"}}}},
	"bg:keywords.bg:keyword.raw6":{"filter":{},
	"aggs":{"bg:keywords.bg:keyword.raw":{"terms":{"field":"bg:keywords.bg:keyword.raw","size":10}},
	"bg:keywords.bg:keyword.raw_count":{"cardinality":{"field":"bg:keywords.bg:keyword.raw"}}}}},"size":10}
*/

var searchAPI = {

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

