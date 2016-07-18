//required for the functions
import {render} from 'react-dom';

import Recipe from './Recipe.jsx';
import AnnotationBox from './components/annotation/AnnotationBox.jsx';
import SegmentationControls from './components/annotation/SegmentationControls.jsx';

//export convenience functions

export function cookRecipe (ingredients, elementId) {
	render(<Recipe ingredients={ingredients}/>, document.getElementById(elementId));
}

export function renderAnnotationBox (elementId) {
	render(<AnnotationBox/>, document.getElementById(elementId));
}

export function renderSegmentationControls (elementId) {
	console.debug('Rendering segmentation controls');
	render(<SegmentationControls/>, document.getElementById(elementId));
}

//component exports
export {default as CollectionSelector} from './components/CollectionSelector.jsx';
export {default as FacetSearchComponent} from './components/FacetSearchComponent.jsx';

//mappings
export {default as NISVCatalogueConfig} from './collection/mappings/NISVCatalogueConfig.jsx';

//utils
export {default as TimeUtil} from './util/TimeUtil.js';
