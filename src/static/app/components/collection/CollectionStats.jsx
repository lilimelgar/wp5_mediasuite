import React from 'react';

class CollectionStats extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		//very ugly loop
		let stats = [];
		if(this.props.data && this.props.data.doc_stats) {
			stats.push(<li key="stat_1" className="list-group-item">
				<span className="badge">{this.props.data.doc_stats.no_date_field}</span>
				<span className="badge">{this.props.data.doc_stats.date_field}</span>
				Document with/without date
			</li>);
			stats.push(<li key="stat_2" className="list-group-item">
				<span className="badge">{this.props.data.doc_stats.no_analysis_field}</span>
				<span className="badge">{this.props.data.doc_stats.analysis_field}</span>
				Document with/without analysis field
			</li>);
			stats.push(<li key="stat_3" className="list-group-item">
				<span className="badge">{this.props.data.field_stats.date_field_scope.start} - {this.props.data.field_stats.date_field_scope.end}</span>
				Date range ({this.props.data.field_stats.date_field_scope.unit}s)
			</li>);
			stats.push(<li key="stat_4" className="list-group-item">
				<span className="badge">{this.props.data.field_stats.date_field_out_of_scope}</span>
				Dates outside range
			</li>);
		}

		return (
			<div className="panel panel-default">
				<div className="panel-heading">Collection stats</div>
				<div className="panel-body">
					<ul className="list-group">
						<li className="list-group-item">
							<span className="badge">{this.props.data.collection}</span>
							Name
						</li>
						{stats}
					</ul>
				</div>
			</div>
		);
	}
}

export default CollectionStats;