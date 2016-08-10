const CollectionDataUtil = {

	FORMATS : {
		'OAI_DIDL' : true,
		'CMD' : true
	},

	//TODO later this should be able to format results from different datastores (now it assumes ES data)
	formatSearchResult : function(result) {
		var formattedResult = JSON.parse(JSON.stringify(result._source));
		formattedResult._id = result._id;
		formattedResult._score = result._score;
		formattedResult._type = result._type;
		formattedResult._index = result._index;
		return formattedResult;
	},

	extractStructuredData : function(result) {
		let basicData = {
			title : 'No title',
			date : 'No date',
			abstract : 'No description'
		}
		//try to extract different formats if the data is unknown
		for(let key in result) {
			let pr = CollectionDataUtil.extractDIDLData(result);
			if(pr != null) { basicData = pr; break; }
			pr = CollectionDataUtil.extractCMDData(result);
			if(pr != null) { basicData = pr; break; }
		}
		result.title = result.title ? result.title : basicData.title;
		result.date = result.date ? result.date : basicData.date;
		result.abstract = result.abstract ? result.abstract : basicData.abstract;
		if (basicData.playableContent) {
			result.playableContent = basicData.playableContent;
		}
		return result;
	},

	//verteld verleden collecties hebben veelal DIDL?
	extractDIDLData: function(result) {
		if(result['oaipmh:metadata'] && result['oaipmh:metadata']['didl:DIDL']) {
			return {
				title : result['oaipmh:metadata']['didl:DIDL']['didl:Item']['didl:Item'][0]['didl:Component']['didl:Resource']['mods:mods']['mods:titleInfo']['mods:title'],
				date : result['oaipmh:metadata']['didl:DIDL']['didl:Item']['didl:Item'][0]['didl:Component']['didl:Resource']['mods:mods']['mods:originInfo']['mods:dateCreated'],
				abstract : result['oaipmh:metadata']['didl:DIDL']['didl:Item']['didl:Item'][0]['didl:Component']['didl:Resource']['mods:mods']['mods:abstract'],
				playableContent : null //TODO
			}
		}
		return null;
	},

	//Formaat voor o.a.(?) de soundbites collectie (NB: zoeken door de Soundbites collectie werkt niet!)
	extractCMDData: function(result) {
		if(result['cmd:CMD']) {
			let resourceList = [];
			let rl = result['cmd:CMD']['cmd:Resources']['cmd:ResourceProxyList']['cmd:ResourceProxy'];
			if(rl.length && rl.length > 0) {
				resourceList = rl.map((value) => {
					return {
						url : value['cmd:ResourceRef'],
						mimeType : value['cmd:ResourceType']['@mimetype']
					}
				});
			} else {
				resourceList.push({
					url : rl['cmd:ResourceRef'],
					mimeType : rl['cmd:ResourceType']['@mimetype']
				})
			}
			return {
				title : result['cmd:CMD']['cmd:Components']['cmd:Soundbites-recording']['cmd:SESSION']['cmd:Name'],
				date : result['cmd:CMD']['cmd:Header']['cmd:MdCreationDate'],
				creator : result['cmd:CMD']['cmd:Header']['cmd:MdCreator'],
				playableContent : resourceList
			}
		}
		return null;
	}

}

export default CollectionDataUtil;