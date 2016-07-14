const CollectionDataUtil = {

	FORMATS : {
		'OAI_DIDL' : true,
		'CMD' : true
	},

	extractStructuredData : function(result) {
		let parsedResult = {
			title : 'No title',
			date : 'No date',
			abstract : 'No description'
		}
		//try to extract different formats if the data is unknown
		for(let key in result) {
			let pr = CollectionDataUtil.extractDIDLData(result);
			if(pr != null) { parsedResult = pr; break; }
			pr = CollectionDataUtil.extractCMDData(result);
			if(pr != null) { parsedResult = pr; break; }
		}
		return parsedResult;
	},

	//verteld verleden collecties hebben veelal DIDL?
	extractDIDLData: function(result) {
		if(result['oaipmh:metadata'] && result['oaipmh:metadata']['didl:DIDL']) {
			return {
				title : result['oaipmh:metadata']['didl:DIDL']['didl:Item']['didl:Item'][0]['didl:Component']['didl:Resource']['mods:mods']['mods:titleInfo']['mods:title'],
				date : result['oaipmh:metadata']['didl:DIDL']['didl:Item']['didl:Item'][0]['didl:Component']['didl:Resource']['mods:mods']['mods:originInfo']['mods:dateCreated'],
				abstract : result['oaipmh:metadata']['didl:DIDL']['didl:Item']['didl:Item'][0]['didl:Component']['didl:Resource']['mods:mods']['mods:abstract']
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