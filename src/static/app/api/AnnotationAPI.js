const AnnotationAPI = {

	saveAnnotation : function(target, annotation, callback) {
		console.debug('saving');
		console.debug(target);
		console.debug(annotation);
		var url = _config.ANNOTATION_API_BASE + '/annotation';
		var method = 'POST';
		annotation.target = target; //see AnnotationUtil.generateW3CTargetObject()
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

	deleteAnnotation : function (annotationId, callback) {
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