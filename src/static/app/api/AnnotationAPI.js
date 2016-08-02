const AnnotationAPI = {

	saveAnnotation : function(annotation, callback) {
		var url = _config.ANNOTATION_API_BASE + '/annotation';
		var method = 'POST';
		annotation.resourceURI = "http://data.beeldengeluid.nl/arttube-vimeo-example";
		if(annotation.annotationId) {
			url += '/' + annotation.annotationId;
			method = 'PUT';
		}

		$.ajax({
			url : url,
			type : method,
			data : JSON.stringify(annotation),
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