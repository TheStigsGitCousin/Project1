var radius = 380,
    lineWidth = 3,
    margin = 10;
var offset = radius + margin;
var width = 2 * offset;
var coordinates = [];

d3.tsv("data/data.tsv", function (error, data) {
    var keys = Object.keys(data[0]);
    console.log(JSON.stringify(data[0]));
    console.log("Length = " + data.length);
    
    var filteredData = [];
    data.forEach(function (item) {
        var newItem = [];
        var ind = 0;
        keys.forEach(function (key, i) {
            var val = +item[key];
            if ((item[key]!="") && !isNaN(val)) {
                newItem[ind++] = { "name": key, "value": val };
            }
        });
        filteredData.unshift(newItem);
    });
    
    var newKeys = [];
    keys.forEach(function (key, i) {
        if (data[0][key]!="" && !isNaN(+data[0][key])) {
            newKeys.push(key);
        }
    });

    this.keys = newKeys;
    this.data = filteredData;

    d3.select(".slider")
        .attr("max", data.length)
        .attr("min", 1)
        .attr("value", 1);

    var chart = d3.select(".chart")
    .attr("width", width * 2)
    .attr("height", width);
    
    chart.append("circle")
        .attr("cx", offset)
        .attr("cy", offset)
        .attr("r", radius)
        .attr("fill", "transparent")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3);
    
    var x = d3.scale.linear()
    .range([0, radius]);
    x.domain([0, 1]);
    
    // create a line function that can convert data[] into x and y points
    this.line = d3.svg.line()
    .x(function (d) { return offset + x(d.x); })
    .y(function (d) { return offset + x(d.y); });
    
    var angleDelta = ((2 * Math.PI) / this.keys.length);

    var angle = 0;
    var index = 0;
    var max = 2 * Math.PI;
    var lines = [];
    while (angle < max) {
        lines[index++] = [{ "x": 0, "y": 0 }, { "x": (Math.cos(angle)), "y": (Math.sin(angle)) }];
        angle += angleDelta;
    }
    
    var radiusLines = chart.selectAll(".radiusline")
      .data(lines)
    .enter().append("g")
      .attr("class", "radiusline");

    radiusLines.append("path")
      .attr("d", function (d) { return line(d); })
      .style("stroke", "gray");
    
    var text = chart.selectAll("text")
                    .data(lines)
                    .enter()
                    .append("text");
    
    text.attr("font-size", 15)
        .attr("fill", "black")
        .text(function (d, i) { return newKeys[i]; })
        .attr("transform", function (d, i) {
            var a = Math.atan(d[1].y / d[1].x) * (180 / Math.PI);
            //console.log(newKeys[i] + " " + a.toString()+" "+d[1].x+" "+d[1].y);
            return "translate(" + (offset + x(d[1].x)).toString() + "," + (offset + x(d[1].y)).toString() + ")rotate(" + (d[1].x<0?a:(a-180)).toString() + ")";
    })
        .style("text-anchor", "start");
    
    this.path = chart.append("path")
            .attr("id", "personPath")
            .datum(this.coordinates)
            .attr("d", this.line)
            .style("stroke-width", 2)
            .style("stroke", "steelblue")
            .style("fill", "none");

    UpdateCircleChart(filteredData[0]);

});

function UpdateCircleChart(person){
    var index = 0;
    var currentAngle = 0,
        angleDelta = ((2 * Math.PI) / this.keys.length);
    console.log(JSON.stringify(person));
    person.forEach(function(item) {
        var c = item.value / 10;
        this.coordinates[index++] = { "x": (Math.cos(currentAngle) * c), "y": (Math.sin(currentAngle) * c), "name": item.name };
        //console.log("c = " + JSON.stringify(data[index-1]));
        currentAngle += angleDelta;
    });
    
    this.coordinates[index] = this.coordinates[0];
    
    this.path
        .transition()
        .attr("d", this.line)
        .duration(150)
        .ease("linear")
        .attr("transform", null);
}

function inputChanged(value){
    UpdateCircleChart(this.data[value - 1]);
    console.log(value);
}

