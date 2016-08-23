import MicroEvent from 'microevent';
import AnnotationAPI from '../api/AnnotationAPI';
import AppDispatcher from './AppDispatcher';

//See: https://github.com/jeromeetienne/microevent.js

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
		AnnotationAPI.saveAnnotation(annotation, (data) => {
			//notify all components that just listen to a single target (e.g. FlexPlayer, FlexImageViewer)
			this.trigger(annotation.target.source);
			//then notify all components that are interested in all annotations
			this.trigger('change');
			if(callback) {
				callback(data);
			}
		});
	}

	delete(annotation, callback) {
		AnnotationAPI.deleteAnnotation(annotation, (data, annotation) => {
			//notify all components that just listen to a single target (e.g. FlexPlayer, FlexImageViewer)
			this.trigger(annotation.target.source);
			//then notify all components that are interested in all annotations
			this.trigger('change');
			if(callback) {
				callback(data, annotation);
			}
		});
	}

}

var AppAnnotationStore = new AnnotationStore();

//add support for emitting events
MicroEvent.mixin(AnnotationStore);

AppDispatcher.register( function( action ) {

    switch(action.eventName) {

        case 'save-annotation':

            // We get to mutate data!
            AppAnnotationStore.save(action.annotation, action.callback);
            break;

        case 'delete-annotation':

            // We get to mutate data!
            AppAnnotationStore.delete(action.annotation, action.callback);
            break;

        case 'change-target':

            // We get to mutate data!
            AppAnnotationStore.changeTarget(action.annotationTarget);
            break;

    }

});



export default AppAnnotationStore;