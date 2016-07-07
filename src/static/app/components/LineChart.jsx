/*

Necessary updates / TODO:
1. integrate the cool effects from AVResearcherXL (the graph code is in AVXLChart.js)
2. make sure to improve the toggle buttons that are created for each line (make them configurable, less ugly, etc)
3. make sure to pass the entire query to the LineChart (see Recipe.updateQueryOutputs()) and visualize relevants parts
	of each query/line
4. many more improvements are possible, use your imagination

*/

import React from 'react';

class LineChart extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isMounted : false
		}
	}

	//Simply pass a list of objects (one for the x and one for the y)
	drawChart(data, update) {
		this.x.domain(d3.extent(data, function(d) { return d.year }));
		this.y.domain(d3.extent(data, function(d) { return d.count }));

		let color = d3.scale.category10();

		//group the data by query
		let dataNest = d3.nest()
        	.key(function(d) {return d.query;})
        	.entries(data);

        //spacing for the legend
        let legendSpace = this.width / dataNest.length;
        this.svg.select('.legend').on('click',null);
        this.svg.select('.legend').remove();

        //remove all old lines
        this.svg.select(".line").remove();

        //loop through the queries
		dataNest.forEach(function(d,i) {

			if(update) {
				//update the x axis
				this.svg.select(".x.axis")
	            	.call(this.xAxis);

	            //update the y axis
	        	this.svg.select(".y.axis")
	            	.call(this.yAxis);
			} else {
				//create the x axis
				this.svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(10," + this.height + ")")
					.call(this.xAxis)
					.append("text")
					.attr('x', this.width - 50)
					.attr('y', 0)
					.text('Year');

				//create the y axis
				this.svg.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(10,0)")
					.call(this.yAxis)
					.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", 6)
					.attr("dy", ".71em")
					.style("text-anchor", "end")
					.text("Count");
			}

			if(document.getElementById('tag_'+d.key)) {
	            this.svg.select('#tag_'+d.key)
	            	.attr("d", this.line(d.values));
			} else {
				this.svg.append("path")
				.attr("class", "line")
				.style("stroke", function() {
					return d.color = color(d.key); })
				.attr("id", 'tag_'+d.key)
				.attr("d", this.line(d.values));
			}

			//draw a toggle button for each line. TODO improve this ugly stuff
			this.svg.append("text")
	            .attr("x", (legendSpace/2)+i*legendSpace)
	            .attr("y", this.height + (this.margin.bottom/2)+ 25)
	            .attr("class", "legend")
	            .style("fill", function() {
	                return d.color = color(d.key); })
	            .on("click", function() {
	                let active = d.active ? false : true,
	                newOpacity = active ? 0 : 1;
	                d3.select("#tag_"+d.key)
	                    .transition().duration(100)
	                    .style("opacity", newOpacity);
	                d.active = active;
	                })
	            .text(d.key);


	    }.bind(this));


	}

	//only called the first time after rendering
	componentDidMount() {
		//this.initLineChart();
	}

	initLineChart(data) {
		//setup the global d3 variables / elements
		this.margin = {top: 20, right: 20, bottom: 80, left: 50};
		this.width = 960 - this.margin.left - this.margin.right,
		this.height = 400 - this.margin.top - this.margin.bottom;

		this.svg = d3.select('#line_chart')
			.append("svg")
				.attr("width", this.width + this.margin.left + this.margin.right)
				.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g")
				.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		this.x = d3.scale.linear()
			.range([0, this.width]);

		this.y = d3.scale.linear()
			.range([this.height, 0]);

		this.xAxis = d3.svg.axis()
			.scale(this.x)
			.orient("bottom");

		this.yAxis = d3.svg.axis()
			.scale(this.y)
			.orient("left");

		this.line = d3.svg.line()
			.x(function(d) { return this.x(d.year); }.bind(this))
			.y(function(d) { return this.y(d.count); }.bind(this));

		//format the ES query data and draw render the line chart
		this.prepareChartData(data, function(formattedData) {
			this.drawChart(formattedData, false);
			this.setState({isMounted : true});
		}.bind(this));
	}

	//called whenever the state changes (usually whenever an owner of this component is passing new data)
	componentDidUpdate() {
		if(this.props.data) {
			if(this.state.isMounted) {
				this.prepareChartData(this.props.data, function(formattedData) {
					this.drawChart(formattedData, true);
				}.bind(this));
			} else {
				this.initLineChart(this.props.data);
			}
		}
	}

	//TODO properly handle queries with an unknown datefield
	prepareChartData(data, callback) {
		let formattedData = [];
		if(data) {
			for(let query in data) {
				let item = data[query].output;
				for(let key in item.aggregations) {
					if(key.indexOf(data[query].dateField) != -1) {
						item.aggregations[key][data[query].dateField].buckets.forEach(function(bucket) {
							let y = parseInt(bucket.key.substring(0,4));
							if(y > 0) {
								formattedData.push({year: y, count : bucket.doc_count, query : query});
							}
						});
					}
				}
			}
		}
		callback(formattedData);
	}

	render() {
		return (
			<div id="line_chart"/>
		)
	}
}

export default LineChart;