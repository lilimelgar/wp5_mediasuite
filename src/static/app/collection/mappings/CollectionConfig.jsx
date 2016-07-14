import React from 'react';
import CollectionDataUtil from '../../util/CollectionDataUtil.js';

//base class for each collection configuration
class CollectionConfig {
	constructor(){}

	getDocumentType() {return null;}

	getSearchableFields() {return null;}

	getDateFields() {return null;}

	getFacets() {return null;}

	getItemDetailData(result) {
		console.debug(result);
		return CollectionDataUtil.extractStructuredData(result);
	}

	getResultSnippetData(result) {
		return {
			title: result.title,
			date: result.date
		}
	}
}

export default CollectionConfig;