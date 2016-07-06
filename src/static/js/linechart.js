//NOTE: This is Marijn's code used for collections.html.
//It should be (partly) integrated with /static/app/compnents/LineChart.js

var drawTimeline = function(timelineData) {
    var margin = {top: 20, right: 30, bottom: 30, left: 70},
        width = 960 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var formatDate = d3.time.format("%Y");
    var bisectDate = d3.bisector(function(d) { return d.year;  }).left; // **

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var valueline = d3.svg.line()
        .x(function(d) { return x(d.year);  })
        .y(function(d) { return y(d.count);  });

    var svg = d3.select("#show_timeline").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var lineSvg = svg.append("g");                             // **********

    var focus = svg.append("g")                                // **********
        .style("display", "none");                             // **********

    x.domain(d3.extent(timelineData, function(d) { return d.year }));
    y.domain(d3.extent(timelineData, function(d) { return d.count }));

    lineSvg.append("path")                                 // **********
        .attr("class", "line")
        .attr("d", valueline(timelineData));


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(10," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        //.attr("transform", "translate(10,0)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Count");

    // append the x line
    focus.append("line")
        .attr("class", "x")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", height);

    // append the y line
    focus.append("line")
        .attr("class", "y")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("x1", width)
        .attr("x2", width);

    // append the circle at the intersection
    focus.append("circle")
        .attr("class", "y")
        .style("fill", "none")
        .style("stroke", "blue")
        .attr("r", 4);

    // place the value at the intersection
    focus.append("text")
        .attr("class", "y1")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "-.3em");
    focus.append("text")
        .attr("class", "y2")
        .attr("dx", 8)
        .attr("dy", "-.3em");

    // place the date at the intersection
    focus.append("text")
        .attr("class", "y3")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "1em");
    focus.append("text")
        .attr("class", "y4")
        .attr("dx", 8)
        .attr("dy", "1em");

    svg.append("rect")                                     // **********
        .attr("width", width)                              // **********
        .attr("height", height)                            // **********
        .style("fill", "none")                             // **********
        .style("pointer-events", "all")                    // **********
        .on("mouseover", function() { focus.style("display", null);  })
        .on("mouseout", function() { focus.style("display", "none");  })
        .on("mousemove", mousemove);                       // **********

    function mousemove() {                                 // **********
        var x0 = x.invert(d3.mouse(this)[0]),              // **********
            i = bisectDate(timelineData, x0, 1),                   // **********
            d0 = timelineData[i - 1],                              // **********
            d1 = timelineData[i],                                  // **********
            d = x0 - d0.year > d1.year - x0 ? d1 : d0;     // **********

        focus.select("circle.y")                           // **********
            .attr("transform",                             // **********
                  "translate(" + x(d.year) + "," +         // **********
                                 y(d.count) + ")");        // **********

        focus.select("text.y1")
            .attr("transform",
                    "translate(" + x(d.year) + "," +
                    y(d.count) + ")")
            .text(d.count);

        focus.select("text.y2")
            .attr("transform",
                    "translate(" + x(d.year) + "," +
                    y(d.count) + ")")
            .text(d.count);

        focus.select("text.y3")
            .attr("transform",
                    "translate(" + x(d.year) + "," +
                    y(d.count) + ")")
            .text(formatDate(d.year));

        focus.select("text.y4")
            .attr("transform",
                    "translate(" + x(d.year) + "," +
                    y(d.count) + ")")
            .text(formatDate(d.year));

        focus.select(".x")
            .attr("transform",
                    "translate(" + x(d.year) + "," +
                    y(d.count) + ")")
            .attr("y2", height - y(d.count));

        focus.select(".y")
            .attr("transform",
                    "translate(" + width * -1 + "," +
                    y(d.count) + ")")
            .attr("x2", width + width);

    }                                                      // **********

/*
    svg.append("path")
        .datum(timelineData)
        .attr("transform", "translate(10,0)")
        .attr("class", "line")
        .attr("d", valueline);
        */


    function type(d) {
        d.year = formatDate.parse(d.year);
        d.count = +d.count;
        return d;

    }



}
