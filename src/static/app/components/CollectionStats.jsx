import React from 'react';

class CollectionStats extends React.Component {

	constructor(props) {
		super(props);
		// this.setState({
		console.debug(props);
		// });
	}

	render() {
		return (
			<div className="panel panel-default">
				<div className="panel-heading">Collection stats</div>
				<div className="panel-body">
					<ul className="list-group">
						<li className="list-group-item">
							<span className="badge">{this.props.data.collection}</span>
							Name
						</li>
						<li className="list-group-item">
							<span className="badge">{this.props.data.doc_stats.no_date_field}</span>
							<span className="badge">{this.props.data.doc_stats.date_field}</span>
							Document with/without date
						</li>
						<li className="list-group-item">
							<span className="badge">{this.props.data.doc_stats.no_analysis_field}</span>
							<span className="badge">{this.props.data.doc_stats.analysis_field}</span>
							Document with/without analysis field
						</li>
						<li className="list-group-item">
							<span className="badge">{this.props.data.field_stats.date_field_scope.start} - {this.props.data.field_stats.date_field_scope.end}</span>
							Date range ({this.props.data.field_stats.date_field_scope.unit}s)
						</li>
						<li className="list-group-item">
							<span className="badge">{this.props.data.field_stats.date_field_out_of_scope}</span>
							Dates outside range
						</li>
					</ul>
				</div>
			</div>
		);
	}
}

export default CollectionStats;
