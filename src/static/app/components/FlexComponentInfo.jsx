import React from 'react';
import CollectionSelector from './CollectionSelector.jsx';

class FlexComponentInfo extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			componentConfig : null
		}
	}

	generateComponentConfig() {

	}

	//TODO extend this to something more elaborate that also includes the component config
	render() {
		let config = {
			key : "testbox",
			blockId : "labs-catalogue-aggr",
			searchAPI: _config.SEARCH_API_BASE,
			indexPath: '/search/labs-catalogue-aggr',
			prefixQueryFields: this.props.config.getSearchableFields(),
			dateFields: this.props.config.getDateFields(),
			facets: this.props.config.getFacets(),
		}

		//generate the config form TODO
		// let configFormFields = Object.keys(this.props.config).map((key, index) => {
		// 	let option = this.props.config[key];
		// 	if(option.type == 'collection_selector') {
		// 		return (
		// 			<CollectionSelector/>
		// 		)
		// 	}
		// })

		let childrenWithProps = '';
		if(this.props.config) {//this.state.componentConfig
			childrenWithProps = React.Children.map(this.props.children,
				(child) => React.cloneElement(child, config)//this.state.componentConfig
			);
		}
		return (
			<div>
				<div className="panel panel-default">
					<div className="panel-heading">
						<h3 className="panel-title">{this.props.title}</h3>
					</div>
					<div className="panel-body">
						{this.props.description}

					</div>
				</div>
				{childrenWithProps}
			</div>
		)
	}
}

export default FlexComponentInfo;