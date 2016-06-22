/*

TODO this file is now used in recipes.html, but eventually should be removed alltogether.
Basically it loads a recipe (see cookRecipe()) and renders it on the screen.

TODO what really should be done is defining an easy way to configure the recipes, e.g. using a simple JSON config

*/

//intializes all of the configured components on the screen
function cookRecipe(ingredients) {
	ReactDOM.render(
		<Recipe
			ingredients={ingredients}
		/>, document.getElementById('recipe')
	);
}

cookRecipe({
	collectionSelector: true, //make the selector more configurable
	collections: [ //these are actually the default collections, the rest should be selectable via the collectionSelector
		'labs-catalogue-aggr',
		'nisv_programguides',
	],
	lineChart: true //TODO later make sure that this has a more elaborate config
});