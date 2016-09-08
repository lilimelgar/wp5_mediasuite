import React from 'react';
import TimeUtil from '../../util/TimeUtil';
import CollectionConfig from './CollectionConfig';

export class TwitterConfig extends CollectionConfig {
	constructor() {
		super();
	}

	getDocumentType() {
		return 'tweets';
	}

	getSearchableFields() {
		return null;//["page.text", 'page.guidId'];
	}

	getSnippetFields() {
		return false;
	}

	getFacets() {
		return [
			{
				field: 'filter_level',
				title: 'Filter level',
				id: 'filter_level',
				operator: 'AND',
				size:10
			},
			{
				field: 'lang',
				title: 'Language',
				id: 'lang',
				operator: 'AND',
				size:10
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

export default TwitterConfig;