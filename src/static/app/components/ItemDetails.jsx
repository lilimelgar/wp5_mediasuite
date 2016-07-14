import React from 'react';

class ItemDetails extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		let resultDetails = Object.keys(this.props.data).map((key, index)=> {
			if(typeof this.props.data[key] == 'string') {
				return (<span key={'props__' + index}><strong>{key}:&nbsp;</strong>{this.props.data[key]}<br/></span>);
			} else if(key == 'playableContent') {

				//TODO cluster all of the media players, so it's possible to draw them in a separate panel for each media type
				let mediaItems = this.props.data[key].map((mediaItem, subIndex) => {
					let mediaPlayer = 'Item: ' + subIndex;

					/*
					* Draw a media player based on the mimetype of each item
					* TODO put each player in a separate React component
					*/
					if(mediaItem.mimeType.indexOf('image') != -1) {//image player
						mediaPlayer = (
							<a href={mediaItem.url}
								target="__external">
								<img src={mediaItem.url}/>
							</a>
						)
					} else if(mediaItem.mimeType.indexOf('audio') != null) {//audio player
						mediaPlayer = (
							<audio controls>
								<source src={mediaItem.url} type={mediaItem.mimeType}/>
								Your browser does not support the audio element
							</audio>
						)
					} else if(mediaItem.mimeType.indexOf('video') != -1) {//video player
						<video width="320" height="240" controls>
							<source src={mediaItem.url} type={mediaItem.mimeType}/>
							Your browser does not support the video element
						</video>
						//deze zou video moeten hebben:
						//https://easy.dans.knaw.nl/oai/?verb=GetRecord&identifier=oai:easy.dans.knaw.nl:easy-dataset:60508&metadataPrefix=oai_dc
						//in ES: nederlandse-oud-gevangenen-van-kamp-buchenwald
					}

					return (
						<div key={'props__' + index + '_' + subIndex} className="media-player">
							{mediaPlayer}
						</div>
					);
				});
				return (
					<div key={'props__' + index}>
						{mediaItems.slice(0, 5)}
					</div>
				)
			}
		});
		return (
			<div>
				{resultDetails}
			</div>
		)
	}
}

export default ItemDetails;