import React from 'react';

class SegmentationControls extends React.Component {

	constructor(props) {
		super(props);
	}

	setManualStart() {
		setManualStart();
	}

	setStart() {
		setStart();
	}

	playStart() {
		playStart();
	}

	setManualEnd() {
		setManualEnd();
	}

	setEnd() {
		setEnd();
	}

	playEnd() {
		playEnd();
	}

	render() {
		return (
			<div className="row">
				<div className="col-sm-6">
					<div className="input-group">
						<span className="input-group-addon start-group">
							Start
						</span>
						<input id="start_time" type="text" className="form-control" placeholder="00:00:00"/>
						<span className="input-group-btn">
							<button className="btn btn-default" type="button" onClick={this.setManualStart.bind(this)}
								title="When you press this the start time will be set to the time you entered in the input field">
								Set
							</button>
							<button className="btn btn-default" type="button" onClick={this.setStart.bind(this)}
								title="When you press this the start time will be same as the current player time (press i)">
								Copy
							</button>
							<button className="btn btn-default" type="button" onClick={this.playStart.bind(this)}
								title="When you press this, the player will skip to the defined starting point (SHIFT+i)">
								Go!
							</button>
						</span>
					</div>
				</div>
				<div className="col-sm-6">
					<div className="input-group">
						<span className="input-group-addon end-group">&nbsp;End&nbsp;</span>
						<input id="end_time" type="text" className="form-control" placeholder="00:00:00"/>
						<span className="input-group-btn">
							<button className="btn btn-default" type="button" onClick={this.setManualEnd.bind(this)}
								title="When you press this the end time will be set to the time you entered in the input field">
								Set
							</button>
							<button className="btn btn-default" type="button" onClick={this.setEnd.bind(this)}
								title="When you press this the end time will be same as the current player time (press o)">
								Copy
							</button>
							<button className="btn btn-default" type="button" onClick={this.playEnd.bind(this)}
								title="When you press this, the player will skip to the defined end point (SHIFT+o)">
								Go!
							</button>
						</span>
					</div>
				</div>
			</div>)
	}

};

export default SegmentationControls;