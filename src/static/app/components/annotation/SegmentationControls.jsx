import React from 'react';
import moment from 'moment';
import TimeUtil from '../../util/TimeUtil';

class SegmentationControls extends React.Component {

	constructor(props) {
		super(props);
	}

	setManualStart() {
		this.props.controls.setManualStart(
			moment.duration(this.refs.startTime.value).asSeconds()
		);
	}

	setManualEnd() {
		this.props.controls.setManualEnd(
			moment.duration(this.refs.endTime.value).asSeconds()
		);
	}

	componentDidUpdate() {
		this.refs.startTime.value = TimeUtil.formatTime(this.props.start);
		this.refs.endTime.value = TimeUtil.formatTime(this.props.end);
	}

	setStart() {
		this.props.controls.setStart();
	}

	setEnd() {
		this.props.controls.setEnd();
	}

	playStart() {
		this.props.controls.playStart();
	}

	playEnd() {
		this.props.controls.playEnd();
	}

	render() {
		return (
			<div className="row">
				<div className="col-sm-6">
					<div className="input-group">
						<span className="input-group-addon start-group">
							Start
						</span>
						<input ref="startTime" type="text" className="form-control" placeholder="00:00:00"
							defaultValue={TimeUtil.formatTime(this.props.start)}/>
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
						<input ref="endTime" type="text" className="form-control" placeholder="00:00:00"
							defaultValue={TimeUtil.formatTime(this.props.end)}/>
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