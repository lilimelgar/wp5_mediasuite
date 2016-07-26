import React from 'react';
import TimeUtil from '../../util/TimeUtil';

//FIXME remove the jQuery dependant stuff

class VideoTimeBar extends React.Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
	    //Run function when browser resizes
	    $(window).resize(this.respondCanvas);
	    this.respondCanvas();
	}

	respondCanvas(){
		var c = $('#timebar_canvas');
	    var ct = c.get(0).getContext('2d');
	    var container = $(c).parent();
		c.attr('width', $(container).width() ); //max width
		c.attr('height', $(container).height() ); //max height
	}

	seek(event) {
		var c = document.getElementById("timebar_canvas");
		var mousePos = this.getMousePos(c, event);
		var dur = this.props.duration;
        var pos = dur / 100 * (mousePos.x / (c.width / 100));
        this.props.seek(pos);
	}

	componentDidUpdate() {
		var c = document.getElementById("timebar_canvas");
		var dur = -1;
        var dur = this.props.duration;
        var t = this.props.curPosition;
        if(!t) {
            t = this.props.start;
        }
        var formattedTime = TimeUtil.formatTime(t);
        var elapsed = c.width / 100 * (t / (dur / 100));
        var startPoint = c.width / 100 * (this.props.start / (dur / 100));
        var endPoint = c.width / 100 * (this.props.end / (dur / 100));
        var ctx = c.getContext("2d");
        ctx.clearRect (0, 0, c.width, c.height);
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0,0, elapsed, c.height / 3);//time progressing
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(startPoint, 0, 3, c.height);//time progressing
        ctx.fillStyle = "#FFFF00";
        ctx.fillRect(endPoint, 0, 3, c.height);//time progressing
        ctx.font = "20px Verdana";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(formattedTime, 10, c.height - 5);
	}

	getMousePos(canvas, evt) {
	    var rect = canvas.getBoundingClientRect();
	    return {
	      x: evt.clientX - rect.left,
	      y: evt.clientY - rect.top
	    };
	}

	render() {
		return (
			<div id="timebar">
				<canvas id="timebar_canvas" width="300" height="50" onClick={this.seek.bind(this)}>
				</canvas>
			</div>
		)
	}
}

export default VideoTimeBar;