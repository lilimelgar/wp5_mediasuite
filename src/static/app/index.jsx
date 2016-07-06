import React from 'react';
import {render} from 'react-dom';
import Recipe from './Recipe.jsx';

const Chef = {
	cookRecipe : function(ingredients) {
		render(<Recipe	ingredients={ingredients}/>, document.getElementById('app'));
	}
}

module.exports = Chef;