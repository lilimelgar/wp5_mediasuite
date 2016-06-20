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
	collections: [
		'labs-catalogue-aggr',
		'nisv_programguides',
		'interviewcollectie-stichting-mondelinge-geschiedenis-indonesie',
		'aletta-instituut-voor-vrouwengeschiedenis'
	],
	lineChart: true
});