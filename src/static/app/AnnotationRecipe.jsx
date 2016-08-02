import React from 'react';

import AnnotationBox from './components/annotation/AnnotationBox';
import TimeUtil from './util/TimeUtil';
import FlexBox from './components/FlexBox';
import FlexPlayer from './player/FlexPlayer';

//TODO this can later be integrated into Recipe.jsx. It's no longer necessary to have different types of recipes
class AnnotationRecipe extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			user : 'JaapTest',
			playerAPI : null,
			start : null,
			end : null,
			currentMediaObject : { //later make sure that this can be changed with some selection component
				url : 'http://player.vimeo.com/video/110756897?api=1&amp;player_id=player_1'
			}
		}
	}

	onPlayerReady(playerAPI) {
		this.setState({playerAPI : playerAPI});
	}

	//test to see if it works when setting a new video
	dummyChangeVideo() {
		this.setState({
			currentMediaObject : {url : 'http://player.vimeo.com/video/176894130?api=1&amp;player_id=player_1'}
		});
	}

	/************************************** Timeline controls ***************************************/

	render() {
		return (
			<div>
				<div className="row">
					<div className="col-md-12">
						<div className="input-group">
							<span className="input-group-btn">
								<button type="button" className="btn btn-info"
									onClick={this.dummyChangeVideo.bind(this)}>
									Andere video
								</button>
							</span>
						</div>
						<FlexPlayer player={this.props.ingredients.playerType}
							onPlayerReady={this.onPlayerReady.bind(this)}
							annotationSupport={this.props.ingredients.annotationSupport}
							annotationModes={this.props.ingredients.annotationModes}
							mediaObject={this.state.currentMediaObject}/>
					</div>
				</div>
			</div>
		)
	}

}

export default AnnotationRecipe;