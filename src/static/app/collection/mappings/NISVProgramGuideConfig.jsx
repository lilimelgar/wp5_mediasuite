import React from 'react';
import TimeUtil from '../../util/TimeUtil.js';
import CollectionConfig from './CollectionConfig.jsx';

export class NISVProgramGuideConfig extends CollectionConfig {
	constructor() {
		super();
	}

	getDocumentType() {
		return 'block';
	}

	getSearchableFields() {
		return ["block.text"];
	}

	getFacets() {
		var ranges = TimeUtil.generateYearAggregationSK(1910, 2010);
		return [
			{
				field: 'guideId',
				title: 'Omroep',
				id: 'broadcaster',
				operator: 'AND',
				size:10
			},
			{
				field: 'blockType',
				title: 'Type blok',
				id: 'blockType',
				operator: 'AND',
				size:10
			},
			{
				field: 'year',
				title: 'Jaar',
				id: 'jaar',
				size:10,
				ranges: ranges

			}
		];
	}

	getDateFields() {
		return ['jaar'];
	}

	getItemDetailData(result) {
		return result;
	}

	getResultSnippetData(result) {
		return {
			id: result.id,
			text: result.text,
			broadcastDate: result.broadcast_date,
			year: result.year
		}

	}
}

export default NISVProgramGuideConfig;