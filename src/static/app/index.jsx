import React from 'react';
import {render} from 'react-dom';
import Recipe from './Recipe.jsx';
import AnnotationBox from './components/annotation/AnnotationBox.jsx';
import SegmentationControls from './components/annotation/SegmentationControls.jsx';

const Chef = {
	cookRecipe : function(ingredients, elementId) {
		render(<Recipe	ingredients={ingredients}/>, document.getElementById(elementId));
	},

	renderAnnotationBox : function(elementId) {
		render(<AnnotationBox/>, document.getElementById(elementId));
	},

	renderSegmentationControls : function(elementId) {
		console.debug('Rendering segmentation controls');
		render(<SegmentationControls/>, document.getElementById(elementId));
	}
}

module.exports = Chef;