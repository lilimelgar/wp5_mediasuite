/*

The CollectionUtil object/namespace groups a bunch of functions related to:
1. collection stats obtained from the CollectionAPI in getCollectionStats()
2. collection configurations/mappings listed in /ui_components_src/search/mappings

This basically contains the logic for determining what collection (date & string) fields to use in the FacetSearchComponent.
In general what needs to be considered is:
1. Does the collection have a (human defined) mapping?
2. Does the collection have automatically generated statistics (mostly related to what type of fields are available for search)
3. Based on these two things, how do I automatically select a desirable configuration for the FacetSearchComponent (or others later on)

*/

import {CollectionConfig} from '../collection/mappings/CollectionConfig.jsx';
import {NISVCatalogueConfig} from '../collection/mappings/NISVCatalogueConfig.jsx';
import {NISVProgramGuideConfig} from '../collection/mappings/NISVProgramGuideConfig.jsx';
import {SpeechAndernieuwsConfig} from '../collection/mappings/SpeechAndernieuwsConfig.jsx';
import TimeUtil from '../util/TimeUtil.js';

const CollectionUtil = {

	COLLECTION_MAPPING : {
		'__default__' : new CollectionConfig(),
		'labs-catalogue-aggr': new NISVCatalogueConfig(),
		'nisv_programguides': new NISVProgramGuideConfig(),
		'spraak__andernieuws' : new SpeechAndernieuwsConfig()
	},

	determineConfig : function(collectionId) {
		var config = CollectionUtil.COLLECTION_MAPPING[collectionId];
		if(config == undefined) {
			config = new CollectionConfig();
		}
		return config;
	},

	determineDocType : function(collectionStats, collectionConfig) {
		var docType = collectionConfig.getDocumentType();
		if(!docType && collectionStats.collection_statistics.document_types.length > 0) {
			docType = collectionStats.collection_statistics.document_types[0].doc_type;
		}
		return docType;
	},

	determineSearchableFields : function(collectionStats, collectionConfig) {
		var searchableFields = collectionConfig.getSearchableFields();
		if(!searchableFields && collectionStats.collection_statistics.document_types.length > 0) {
			// return empty list if collection has no string fields
			searchableFields = collectionStats.collection_statistics.document_types[0].fields.string || [];
		}
		return searchableFields;
	},

	//FIXME this function is too similar to determineSearchableFields
	determineDateFields : function(collectionStats, collectionConfig) {
		var dateFields = collectionConfig.getDateFields();
		if(!dateFields && collectionStats.collection_statistics.document_types.length > 0) {
			// return empty list if collection has no date fields
			dateFields = collectionStats.collection_statistics.document_types[0].fields.date || [];
		}
		return dateFields;
	},

	determineFacets : function(dateFields, collectionConfig) {
		var facets = collectionConfig.getFacets();
		if(!facets && dateFields && dateFields.length > 0) {
			var ranges = TimeUtil.generateYearAggregationSK(1910, 2010);
			facets = [{
				field: dateFields[0],
				title : 'Datum',
				id : dateFields[0],
				operator : 'AND',
				size : 10,
				ranges: ranges//this yearly range is only for being able to draw the timeline
			}]
		}
		return facets;
	}

}

export default CollectionUtil;