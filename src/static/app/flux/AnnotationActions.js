import AppDispatcher from './AppDispatcher';

const AnnotationActions = {

	save : function(annotation, callback) {
		AppDispatcher.dispatch({
            eventName: 'save-annotation',
            annotation: annotation,
            callback: callback
        });
	},

	delete : function(annotation, callback) {
		AppDispatcher.dispatch({
            eventName: 'delete-annotation',
            annotation: annotation,
            callback: callback
        });
	},

	changeTarget : function(annotationTarget) {
		AppDispatcher.dispatch({
            eventName: 'change-target',
            annotationTarget: annotationTarget
        });
	}

}

export default AnnotationActions;