import React from 'react';
import TimeUtil from '../../util/TimeUtil.js';
import CollectionConfig from './CollectionConfig.jsx';

export class NISVProgramGuideConfig extends CollectionConfig {
	constructor() {
		super();
	}

	getDocumentType() {
		return 'page';
	}

	getSearchableFields() {
		return null;//["page.text", 'page.guidId'];
	}

	getSnippetFields() {
		return false;
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
				field: 'doc_type',
				title: 'Type document',
				id: 'doc_type',
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
		result.title = result.id;
		console.debug(result);
		//http://hugodrax.beeldengeluid.nl:84/fcgi-bin/iipsrv.fcgi?IIIF=BG0261104_0081.tif/108,1876,514,29/full/0/default.jpg
		return result;
	}

	getResultSnippetData(result) {
		return {
			id: result._id,
			text: result.text,
			broadcastDate: result.broadcast_date,
			year: result.year
		}

	}
}

export default NISVProgramGuideConfig;