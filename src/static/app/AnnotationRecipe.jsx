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
			playerAPI : null
		}
	}

	onPlayerReady(playerAPI) {
		console.debug('The recipe also knows');
		this.setState({playerAPI : playerAPI});
	}

	/************************************** Timeline controls ***************************************/

	render() {

		return (
			<div>
				<div className="row">
					<div className="col-md-7">
						<FlexPlayer player={this.props.ingredients.playerType}
							onPlayerReady={this.onPlayerReady.bind(this)}/>
					</div>
					<div className="col-md-5">
						<FlexBox>
							<AnnotationBox
								start={this.state.start}
								end={this.state.end}
								user={this.state.user}
								playerAPI={this.state.playerAPI}
								annotationModes={this.props.ingredients.annotationModes}
							/>
						</FlexBox>
					</div>
				</div>
			</div>
		)
	}

}

export default AnnotationRecipe;