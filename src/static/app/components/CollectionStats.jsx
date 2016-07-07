import React from 'react';

class CollectionStats extends React.Component {

	constructor(props) {
		super(props);
		// this.setState({

		// });
	}

	render() {
		return (
			<div className="panel panel-default">
				<div className="panel-heading">Collection stats</div>
				<div className="panel-body">
					<ul className="list-group">
						<li className="list-group-item">
							<span className="badge">{this.props.data.service.collection}</span>
							Name
						</li>
						<li className="list-group-item">
							<span className="badge">t.b.d.</span>
							Correctly filled in dates
						</li>
						<li className="list-group-item">
							<span className="badge">t.b.d.</span>
							Probably incorrect dates
						</li>
						<li className="list-group-item">
							<span className="badge">t.b.d.</span>
							Docs with missing dates
						</li>
					</ul>
				</div>
			</div>
		);
	}
}

export default CollectionStats;