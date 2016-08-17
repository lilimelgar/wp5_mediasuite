//aims to implement https://www.w3.org/TR/annotation-model

const AnnotationUtil = {

	extractTemporalFragmentFromURI : function(uri) {
		let i = uri.indexOf('#t=');
		if(i != -1) {
			return uri.substring(i + 3).split(',');
		}
		return null;
	},

	extractSpatialFragmentFromURI : function(uri) {
		let i = uri.indexOf('#xywh=');
		if(i != -1) {
			let arr = uri.substring(i + 6).split(',');
			return {
				'x' : arr[0],
				'y' : arr[1],
				'w' : arr[2],
				'h' : arr[3]
			}
		}
		return null;
	},

	//media fragments are simply reflected in the source without supplying a selector (for now)
	//a target always has a source
	generateW3CEmptyAnnotation : function(user, source, mimeType, params) {
		if(!source) {
			return null;
		}
		let selector = null; //when selecting a piece of the target
		let targetType = null;

		//only try to extract/append the spatio-temporal parameters from the params if there is a mimeType
		if(mimeType && params) {
			if(mimeType.indexOf('video') != -1 && params) {
				targetType = 'Video';
				if(params.start && params.end && params.start != -1 && params.end != -1) {
					selector = {
						"type": "FragmentSelector",
						"conformsTo": "http://www.w3.org/TR/media-frags/",
						"value": '#t=' + params.start + ',' + params.end
	    			}
				}
			} else if(mimeType.indexOf('audio') != -1 && params) {
				targetType = 'Audio';
				if(params.start && params.end && params.start != -1 && params.end != -1) {
					selector = {
						"type": "FragmentSelector",
						"conformsTo": "http://www.w3.org/TR/media-frags/",
						"value": '#t=' + params.start + ',' + params.end
	    			}
				}
			} else if(mimeType.indexOf('image') != -1) {
				targetType = 'Image';
				if(params.rect) {
					selector = {
						"type": "FragmentSelector",
						"conformsTo": "http://www.w3.org/TR/media-frags/",
						"value": '#xywh=' + params.rect.x + ',' + params.rect.y + ',' + params.rect.w + ',' + params.rect.h
	    			}
				}
			}
		}
		return {
			id : null,
			user : user, //TODO like the selector, generate the w3c stuff here?
			target : {
				source: source,
				selector: selector,
				type: targetType
			}
		}
	}

}

//'format': 'application/pdf',
			//'language': ['en', 'ar'],
			//'textDirection': 'ltr',
			//'processingLanguage': 'en'
			/*
			"source" : "http://someurl"
	    	"selector": {
			      "type": "TextQuoteSelector",
			      "exact": "anotation",
			      "prefix": "this is an ",
			      "suffix": " that has some"
			    }
			   "selector": {
			      "type": "TextPositionSelector",
			      "start": 412,
			      "end": 795
			    }
			   "selector": {
			      "type": "CssSelector",
			      "value": "#elemid > .elemclass + p"
			    }
			    "selector": {
			      "type": "XPathSelector",
			      "value": "/html/body/p[2]/table/tr[2]/td[3]/span"
			    }
			    "selector": {
			      "type": "DataPositionSelector",
			      "start": 4096,
			      "end": 4104
			    }
			    "selector": {
			      "type": "SvgSelector",
			      "value": "<svg:svg> ... </svg:svg>"
			    }

				OR WITH BOTH START END END (FOR RANGES)
			    "selector": {
			      "type": "RangeSelector",
			      "startSelector": {
			        "type": "XPathSelector",
			        "value": "//table[1]/tr[1]/td[2]"
			      },
			      "endSelector": {
			        "type": "XPathSelector",
			        "value": "//table[1]/tr[1]/td[4]"
			      }
			    }

			    OR CHAINED
			    "selector": {
			      "type": "FragmentSelector",
			      "value": "para5",
			      "refinedBy": {
			        "type": "TextQuoteSelector",
			        "exact": "Selected Text",
			        "prefix": "text before the ",
			        "suffix": " and text after it"
			      }
			    }

			    SUPPLY THE STATE OF THE TARGET

			    "state": {
			      "type": "TimeState",
			      "sourceDate": "2016-02-01T12:05:23Z",
			      "refinedBy": {
			        "type": "HttpRequestState",
			        "value": "Accept: application/pdf",
			        "refinedBy": {
			          "type": "FragmentSelector",
			          "value": "page=10",
			          "conformsTo": "http://tools.ietf.org/rfc/rfc3778"
			        }
			      }
			    }
			*/

export default AnnotationUtil;