const AnnotationAPI = {

	saveAnnotation : function(annotationId, annotationData, callback) {
		console.debug('Saving annotation...');
		console.debug(annotationData);

		var url = _config.ANNOTATION_API_BASE + '/annotation';
		var method = 'POST';
		var data = {
			data: [
				{
				key: 'tags',
				value: annotationData
				}
			],
			resourceURI: "http://data.beeldengeluid.nl/arttube-vimeo-example",
			start : _start, //grab this from the player
			end : _end //grab this from the player

		}
		if(annotationId) {
			url += '/' + annotationId;
			method = 'PUT';
			data["annotationId"] = annotationId;
		}

		$.ajax({
			url : url,
			type : method,
			data : JSON.stringify(data),
			//dataType : 'application/json',
			success : function(data) {
				if(callback){
					callback(data);
				}
			},
			error : function(err) {
				console.debug('ERROR!');
				console.debug(err);
			}
		});
	},

	getAnnotation : function(annotationId) {
		console.debug('GETTING THIS ANNOTATION: ' + annotationId)
		if(annotationId) {
			$.ajax({
				url : _config.ANNOTATION_API_BASE + '/annotation/' + annotationId,
				type : 'GET',
				//dataType : 'application/json',
				success : function(data) {
					console.debug(data);
				},
				error : function(err) {
					console.debug(err);
				}
			});
		}
	},

	getAnnotations : function(callback) {
		$.ajax({
			url : _config.ANNOTATION_API_BASE + '/annotation',
			type : 'GET',
			//dataType : 'application/json',
			success : function(data) {
				callback(data);
			},
			error : function(err) {
				console.debug(err);
			}
		});
	},

	deleteAnnotation : function (annotationId, callback) {
		console.debug('DELETING ' + annotationId);
		if(annotationId) {
			$.ajax({
				url : _config.ANNOTATION_API_BASE + '/annotation/' + annotationId,
				type : 'DELETE',
				//dataType : 'application/json',
				success : function(data) {
					if(callback) {
						callback(data)
					}
				},
				error : function(err) {
					console.debug(err);
				}
			});
		}
	}
}

export default AnnotationAPI;