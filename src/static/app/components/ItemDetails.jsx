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
				console.debug('Got some content biatches');
				console.debug(this.props.data[key]);
				let mediaItems = this.props.data[key].map((mediaItem, subIndex) => {
					let mediaPlayer = 'Item: ' + subIndex;
					if(mediaItem.mimeType.indexOf('image') != -1) {
						mediaPlayer = (
							<a href={mediaItem.url}
								target="__external">
								<img src={mediaItem.url}/>
							</a>
						)
					}else if(mediaItem.mimeType.indexOf('audio') != null) {
						mediaPlayer = (
							<audio controls>
								<source src={mediaItem.url} type={mediaItem.mimeType}/>
								Your browser does not support the audio element
							</audio>
						)
					}
					return (
						<div key={'props__' + index + '_' + subIndex} className="media-player">
							{mediaPlayer}
						</div>
					);
				})
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