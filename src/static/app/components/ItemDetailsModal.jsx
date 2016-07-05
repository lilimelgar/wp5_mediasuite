//gebaseerd op: https://jsfiddle.net/16j1se1q/1/

var $ = require('jquery');
window.$ = $;

import React from 'react';
import ReactDOM from 'react-dom'

class ItemDetailsModal extends React.Component {

	constructor(props) {
		super(props);
		this.state = {

		}
	}

	componentDidMount() {
		$(ReactDOM.findDOMNode(this)).modal('show');
		$(ReactDOM.findDOMNode(this)).on('hidden.bs.modal', this.props.handleHideModal);
	}

	render() {
		var resultDetails = Object.keys(this.props.data).map((key, index)=> {
			if(typeof this.props.data[key] == 'string') {
				return (<span key={'props__' + index}><strong>{key}:&nbsp;</strong>{this.props.data[key]}<br/></span>)
			}
		});
		return (
			<div className="modal">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal">x</button>
							 <h4 className="modal-title">{this.props.title}</h4>
						</div>
						<div className="modal-body">
							<p>{resultDetails}</p>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-default" data-dismiss="modal"
							>Close</button>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default ItemDetailsModal;