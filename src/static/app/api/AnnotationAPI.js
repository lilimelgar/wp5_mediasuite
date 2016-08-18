const AnnotationAPI = {

	saveAnnotation : function(annotation, callback) {
		var url = _config.ANNOTATION_API_BASE + '/annotation';
		var method = 'POST';
		if(annotation.id) {
			url += '/' + annotation.id;
			method = 'PUT';
		}

		$.ajax({
			url : url,
			type : method,
			data : JSON.stringify(annotation),
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

	deleteAnnotation : function (annotation, callback) {
		console.debug('deleting: ' + annotation.id);
		if(annotation.id) {
			$.ajax({
				url : _config.ANNOTATION_API_BASE + '/annotation/' + annotation.id,
				type : 'DELETE',
				//dataType : 'application/json',
				success : function(data) {
					if(callback) {
						callback(data, annotation)
					}
				},
				error : function(err) {
					console.debug(err);
				}
			});
		}
	},

	//TODO always add the user too!
	getFilteredAnnotations : function(field, value, callback) {
		var url = _config.ANNOTATION_API_BASE + '/annotations/filter';
		url += '?filterType=' + field;
		url += '&value=' + value;
		$.ajax({
			url : url,
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
}

export default AnnotationAPI;