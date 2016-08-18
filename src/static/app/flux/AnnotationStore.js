import MicroEvent from 'microevent';
import AnnotationAPI from '../api/AnnotationAPI';
import AppDispatcher from './AppDispatcher';

class AnnotationStore {

	getAll(callback) {
		AnnotationAPI.getAnnotations(callback);
	}

	getFiltered(field, value, callback) {
		AnnotationAPI.getFilteredAnnotations(field, value, callback);
	}

	changeTarget() {
		this.trigger('change-target');
	}

	save(annotation, callback) {
		console.debug('saving');
		if(annotation.id && annotation.id.indexOf('__annotation_') != -1) {
			annotation.id = null;
		}
		AnnotationAPI.saveAnnotation(annotation, (data) => {
			this.trigger(annotation.target.source);
			this.trigger('change');
			if(callback) {
				callback(data);
			}
		});
	}

	delete(annotation, callback) {
		AnnotationAPI.deleteAnnotation(annotation.id, (data, annotationId) => {
			console.debug('deleted (store) ' + annotationId);
			this.trigger(annotation.target.source);
			this.trigger('change');
			if(callback) {
				callback(data, annotationId);
			}
		});
	}

}

var AppAnnotationStore = new AnnotationStore();

//add support for emitting events
MicroEvent.mixin(AnnotationStore);

AppDispatcher.register( function( action ) {

    switch(action.eventName) {

        // Do we know how to handle this action?
        case 'save-annotation':

            // We get to mutate data!
            AppAnnotationStore.save(action.annotation, action.callback);
            break;

		// Do we know how to handle this action?
        case 'delete-annotation':

            // We get to mutate data!
            AppAnnotationStore.delete(action.annotation, action.callback);
            break;

        // Do we know how to handle this action?
        case 'change-target':

            // We get to mutate data!
            AppAnnotationStore.changeTarget(action.annotationTarget);
            break;

    }

});



export default AppAnnotationStore;