import React from 'react';

class SearchResult extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		let metadata = Object.keys(this.props.data).map((key, index)=> {
			let value = this.props.data[key];
			if(index == 0) {
				value = (<strong>{value}</strong>)
			}
			return (
				<tr key={index}><td>{value}</td></tr>
			);
		});

		return (
			<table>
				<tbody>
					{metadata}
				</tbody>
			</table>
		)
	}
}

export default SearchResult;