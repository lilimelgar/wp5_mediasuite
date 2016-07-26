import React from 'react';

//FIXME a hard dependancy on froogaloop & jQuery!

class VimeoPlayer extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id="video_player">
				<iframe
					id="player_1"
					src="http://player.vimeo.com/video/7100569?api=1&amp;player_id=player_1"
					width="540"
					height="304"
					frameBorder="0">
				</iframe>
			</div>
		)
	}

}

export default VimeoPlayer;