var search_api = "http://blofeld.beeldengeluid.nl:5320/api/v1"

var selectedCollection = null;
var selectedDocType = null;
var selectedDateField = null;
var collectionStats = null;
var timelineData = null;
var dates = {
    correct: 0,
    incorrect: 0,
    missing: 0,
    total: 0
};

var listCollections = function() {
    var url = search_api + "/collections/list_collections";
    console.log(url);
    d3.json(url, function(error, data) {
        addCollectionsToSelect(data);
        return data;
    });
}

var collections = listCollections();

var addCollectionsToSelect = function(collectionList) {
    var select = document.getElementById("collectionSelect");
    //var listDiv = document.getElementById("collection_list");
    collectionList.forEach(function(collection) {
        var collectionName = collection.collection + " -- " + collection.doc_count;
        var option = new Option(collectionName, collection.collection);
        select.appendChild(option);
    })
}

var setCollection = function() {
    var select = document.getElementById("collectionSelect");
	selectedCollection = select.options[select.selectedIndex].value;
    getCollectionStats();
}

var getCollectionStats = function() {
    var url = search_api + "/collections/show_stats?collectionId=" + selectedCollection;
    d3.json(url, function(error, data) {
        collectionStats = data.collection_statistics;
        addDocTypesToSelect(collectionStats.document_types);
        setDocType();
    });
}

var listDocumentTypes = function() {
    var url = search_api + "/collections/show_stats?collectionId=" + selectedCollection;
    d3.json(url, function(error, data) {
        addDocTypesToSelect(data.collection_statistics.document_types);
        return data;
    });
}

var addDocTypesToSelect = function(docTypes) {
    var select = document.getElementById("docTypeSelect");
    select.innerHTML = "";
    var option = new Option("", "");
    select.appendChild(option);
    docTypes.forEach(function(docType) {
         var option = new Option(docType.doc_type + " -- " + docType.doc_count, docType.doc_type);
         select.appendChild(option);
    });
    select.selectedIndex = 1;
}

var setDocType = function() {
    var select = document.getElementById("docTypeSelect");
	selectedDocType = select.options[select.selectedIndex].value;
    collectionStats.document_types.forEach(function(docType) {
        if (docType.doc_type === selectedDocType) {
            addDateFieldsToSelect(docType.fields['date']);
        }
    })
    collectionStats.document_types.forEach(function(docType) {
        if (docType.doc_type === selectedDocType) {
            addFacetFieldsToSelect(docType.fields['not_analyzed']);
        }
    })
}

var addDateFieldsToSelect = function(fields) {
    var select = document.getElementById("dateFieldSelect");
    select.innerHTML = "";
    var option = new Option("", "");
    select.appendChild(option);
    fields.forEach(function(field) {
         var option = new Option(field, field);
         select.appendChild(option);
    });
    select.selectedIndex = 1;
    setDateField();
}

var addFacetFieldsToSelect = function(fields) {
    var select = document.getElementById("facetFieldSelect");
    select.innerHTML = "";
    var option = new Option("", "");
    select.appendChild(option);
    fields.forEach(function(field) {
         var option = new Option(field, field);
         select.appendChild(option);
    });
    select.selectedIndex = 1;
    setFacetField();
}

var setFacetField = function() {
    var select = document.getElementById("facetFieldSelect");
	selectedFacetField = select.options[select.selectedIndex].value;

	var searchUrl = "http://blofeld.beeldengeluid.nl:5320/api/v1/search/" +
		selectedCollection+ "/" + selectedDocType + "/"

}

var setDateField = function() {
    var select = document.getElementById("dateFieldSelect");
	selectedDateField = select.options[select.selectedIndex].value;

	var timelineUrl = "http://blofeld.beeldengeluid.nl:5320/api/v1/collections/show_timeline?collectionId=" +
		selectedCollection+ "&docType=" + selectedDocType + "&dateField=" + selectedDateField;

    d3.json(timelineUrl, function(error, jsonData) {
        if (error) throw error;
        timelineData = cleanTimelineData(jsonData);
        console.log(timelineData);
        showTimeline();
    });
}

var cleanTimelineData = function(data) {
    cleanDates = [];
    var currentYear = new Date().getFullYear()
    console.log(data);
    dates.correct = 0;
    dates.missing = data.no_date_docs.doc_count;
    dates.total = data.doc_counts;
    data.date_histogram.buckets.forEach(function(item) {
        var docYear = parseInt(item.key_as_string);
        if (docYear > 1900 && docYear < currentYear) {
            d = {
                year: formatDate.parse(item.key_as_string),
                count: item.doc_count
            }
            cleanDates.push(d);
            dates.correct += d.count;
        }
        else {
            dates.incorrect++;
        }
    });
    return cleanDates;
};

var formatDate = d3.time.format("%Y");

var showTimeline = function() {
	var statsDiv = document.getElementById("show_stats");
	var timelineDiv = document.getElementById("show_timeline");
	statsDiv.innerHTML = "";
	timelineDiv.innerHTML = "";
    statsDiv.innerHTML =  "Date field completeness:" +
        "<ul><li>Correctly filled in dates: " + dates.correct + "</li>" +
        "<li>Probably incorrect dates: " + dates.incorrect + "</li>" +
        "<li>Docs with missing dates: " + dates.missing + "</li></ul>";

    drawTimeline(timelineData);
}

