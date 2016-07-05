import React from 'react';
import {render} from 'react-dom';
import Recipe from './Recipe.jsx';

class App extends React.Component {
	render () {
		var ingredients = {
			collectionSelector: true,
			collections: [
				'labs-catalogue-aggr',
				'nisv_programguides'
			],
			lineChart: true
		}
		return (
			<Recipe	ingredients={ingredients}/>
		);
	}
}

render(<App/>, document.getElementById('app'));