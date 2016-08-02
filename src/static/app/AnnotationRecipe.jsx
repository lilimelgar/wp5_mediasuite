import React from 'react';

import AnnotationBox from './components/annotation/AnnotationBox';
import TimeUtil from './util/TimeUtil';
import FlexBox from './components/FlexBox';
import FlexPlayer from './player/FlexPlayer';

class AnnotationRecipe extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			user : 'JaapTest',
			playerAPI : null,
			start : null,
			end : null
		}
	}

	onPlayerReady(playerAPI) {
		this.setState({playerAPI : playerAPI});
	}

	/************************************** Timeline controls ***************************************/

	render() {
		return (
			<div>
				<div className="row">
					<div className="col-md-12">
						<FlexPlayer player={this.props.ingredients.playerType}
							onPlayerReady={this.onPlayerReady.bind(this)}
							annotationSupport={this.props.ingredients.annotationSupport}
							annotationModes={this.props.ingredients.annotationModes}/>
					</div>
				</div>
			</div>
		)
	}

	/*
	<div className="col-md-5">
						<FlexBox>
							<AnnotationBox user={this.state.user}
								showList={false}
								playerAPI={this.state.playerAPI}//FIXME dit is een goeie kandidaat voor React context
								annotationModes={this.props.ingredients.annotationModes}/>
						</FlexBox>
					</div>
	*/

}

export default AnnotationRecipe;