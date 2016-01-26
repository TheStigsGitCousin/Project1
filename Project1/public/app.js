
var Colors = {};
Colors.names = {
    aqua: "#00ffff",
    black: "#000000",
    blue: "#0000ff",
    brown: "#a52a2a",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgrey: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkviolet: "#9400d3",
    fuchsia: "#ff00ff",
    gold: "#ffd700",
    green: "#008000",
    indigo: "#4b0082",
    khaki: "#f0e68c",
    lightblue: "#add8e6",
    lightcyan: "#e0ffff",
    lightgreen: "#90ee90",
    lightgrey: "#d3d3d3",
    lightpink: "#ffb6c1",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    magenta: "#ff00ff",
    maroon: "#800000",
    navy: "#000080",
    olive: "#808000",
    orange: "#ffa500",
    pink: "#ffc0cb",
    purple: "#800080",
    violet: "#800080",
    red: "#ff0000",
    silver: "#c0c0c0",
    white: "#ffffff",
    yellow: "#ffff00"
};

var radius = 80,
    lineWidth = 3,
    margin = 50;
var coordinates = [];
var personList = [];
var groupList = [];
var keys=[];
var lines = [];
var x = d3.scale.linear()
            .range([0, radius]);
x.domain([0, 1]);

d3.tsv("data/data.tsv", function (error, data) {
    var dataKeys = Object.keys(data[0]);
    console.log("Length = " + data.length);
    
    data.forEach(function (item) {
        var newItem = {};
        var ind = 0;
        dataKeys.forEach(function (key, i) {
            var val = +item[key];
            if ((item[key]!="") && !isNaN(val)) {
                newItem[key] = val;
            }
        });
        personList.unshift(newItem);
    });
    
    dataKeys.forEach(function (key, i) {
        if (data[0][key]!="" && !isNaN(+data[0][key])) {
            keys.push(key);
        }
    });
    
    var chart = d3.select("#chart")
    .attr("width", $(window).width())
    .attr("height", $(window).height());
    
    var margin2 = { top: 20, right: 20, bottom: 30, left: 40 },
        width2 = 960 - margin2.left - margin2.right,
        height2 = 500 - margin2.top - margin2.bottom;
    
    var x2 = d3.scale.linear().range([0, width2]);
    
    var y2 = d3.scale.linear()
    .rangeRound([height2, 0]);
    
    var color = d3.scale.ordinal()
    .range(generateColors(keys.length));
    
    var xAxis = d3.svg.axis()
    .scale(x2)
    .orient("bottom");
    
    var yAxis = d3.svg.axis()
    .scale(y2)
    .orient("left")
    .tickFormat(d3.format(".2s"));
    
    var svg = chart.append("g")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
  .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
    
    color.domain(keys);
    
    var data2=[];  
    data.forEach(function (d) {
        var item= {};
        var y0 = 0;
        item.ages = color.domain().map(function (name) { return { name: name, y0: y0, y1: y0 += +d[name] }; });
        item.total = item.ages[item.ages.length - 1].y1;
        data2.unshift(item);
    });
    
    data2.sort(function (a, b) { return b.total - a.total; });
        
    x2.domain([0, data.length]);
    y2.domain([0, d3.max(data2, function (d) { return d.total; })]);
        
    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis);
        
    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Population");
        
    var state = svg.selectAll(".state")
    .data(data2)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform", function (d, i) { return "translate(" + x2(i) + ",0)"; });
        
    state.selectAll("rect")
    .data(function (d) { return d.ages; })
    .enter().append("rect")
    .attr("width", 10)
    .attr("y", function (d) { return y2(d.y1); })
    .attr("height", function (d) { return y2(d.y0) - y2(d.y1); })
    .style("fill", function (d) { return color(d.name); });
        
    var legend = svg.selectAll(".legend")
    .data(color.domain().slice().reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });
    
    var offset = radius + margin;
    var width = 2 * offset;
    
    var angleDelta = ((2 * Math.PI) / keys.length);
    var angle = 0;
    var index = 0;
    var max = 2 * Math.PI;
    while (angle < max) {
        lines[index++] = [{ x: 0, y: 0 }, { x: (Math.cos(angle)), y: (Math.sin(angle)) }];
        angle += angleDelta;
    }

    var windowWidth = $(window).width(),
        windowHeight = $(window).height();

    console.log(windowWidth + " " + windowHeight);
    
    // Legend creation
    var legendRadius = 10,
        legendMargin = 50,
        colors = generateColors(keys.length);
    
    var legend = chart.append("g");
    var textLegend = legend.append("g").selectAll("text")
                          .data(keys)
                          .enter()
                          .append("text")
                          .attr("font-size", 15)
                          .attr("fill", "black")
                          .text(function (d, i) { return d; })
                          .attr("transform", function (d, i) { return "translate(" + (windowWidth - legendMargin) + "," + (margin + (legendMargin * i)) + ")"; })
                          .attr("text-anchor", "end");
    
    var maxw = 0;
    textLegend.each(function () {
        if (this.getBBox().width > maxw) maxw = this.getBBox().width;
    });
    legend.append("g").selectAll(".legendCircle")
        .data(keys)
        .enter()
        .append("circle")
        .attr("cx", function (d, i) { return windowWidth - maxw - legendMargin - (2 * legendRadius); })
        .attr("cy", function (d, i) { return margin + (50 * i) - (legendRadius / 2); })
        .attr("r", legendRadius)
        .attr("fill", function (d, i) { return colors[i]; })
        .attr("stroke-width", 3);
    
    var drag = d3.behavior.drag()
    .on("drag", dragmove);
    
    function dragmove(d) {
        var x = d3.event.x;
        var y = d3.event.y;
        console.log("drag " + x + " " + y);
        d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
    }

    var gr = new Group("grouppath" + groupList.length, { x: 100, y: 100 });
    groupList.push(gr);
    gr.addMember(personList[0]);
    gr.addMember(personList[42]);
    var gr2 = new Group("grouppath"+groupList.length, { x: 100, y: 300 });
    groupList.push(gr2);
    gr2.addMember(personList[12]);
    gr2.addMember(personList[21]);

});


function createRadarChart(data, offset, line, id) {
    var chart = d3.select("#chart").append("g");
    
    chart.append("circle")
        .attr("cx", offset.x)
        .attr("cy", offset.y)
        .attr("r", radius)
        .attr("fill", "transparent")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3);
  
    // Create the lines that goes from the middle of the chart and out
    chart.append("g").selectAll(".radiusline")
         .data(lines)
         .enter()
         .append("path")
         .attr("d", function (d) { return line(d); })
         .style("stroke", "gray");
    
    // Generate the colors
    var colors = generateColors(keys.length);
    // Create the circles at the end of the lines, that represents the different keys ("questions")
    chart.append("g").selectAll(".typeCircle")
         .data(lines)
         .enter()
         .append("circle")
         .attr("cx", function (d) { return offset.x + x(d[1].x); })
         .attr("cy", function (d) { return offset.y + x(d[1].y); })
         .attr("r", 10)
         .attr("fill", function (d, i) { return colors[i]; })
         .attr("stroke-width", 3);
    
    chart.append("g")
         .append("path")
         .attr("id", id)
         .datum(data)
         .attr("d", line)
         .style("stroke-width", 2)
         .style("stroke", "steelblue")
         .style("fill", "rgba(0, 0, 0, 0.8)");

    return chart;
}

function generateColors(total) {
    var r = []; // hold the generated colors
    var count = 1;
    for (var prop in Colors.names) {
        r.push(Colors.names[prop]);
        if (count >= total)
            break;
    }
    return r;
}

function Group(id, offset) {
    // create a line function that can convert data[] into x and y points
    this.line = d3.svg.line()
            .x(function (d) { return offset.x + x(d.x); })
            .y(function (d) { return offset.y + x(d.y); });

    this.averageValues = keys.reduce(function (prev, current) { prev.unshift({ name: current, value: 0 }); return prev; }, []);
    this.coordinates = [];
    this.members = [];
    this.id = id;
    this.radarChart = createRadarChart(this.coordinates, offset, this.line, id);
    this.addMember = function (person) {
        this.members.push(person);
        var members = this.members;
        this.averageValues.forEach(function (item) {
            item.value = members.reduce(function (prev, current) { return prev + current[item.name]; }, 0) / members.length;
        });

        updateCoordinates(this.averageValues, this.coordinates);
        
        d3.select("#"+this.id)
        .transition()
        .attr("d", this.line)
        .duration(150)
        .ease("linear")
        .attr("transform", null);
    }
}

function updateCoordinates(averageValues, coordinates) {
    var index = 0;
    var currentAngle = 0,
        angleDelta = ((2 * Math.PI) / keys.length);
    averageValues.forEach(function(item) {
        var c = item.value / 10;
        coordinates[index++] = { x: (Math.cos(currentAngle) * c), y: (Math.sin(currentAngle) * c), name: item.name };
        currentAngle += angleDelta;
    });
    
    coordinates[index] = coordinates[0];
}

function addToGroup(person, group) {
    group.addMember(person);
}

function inputChanged(value){
    updateCircleChart(personList[value - 1]);
    console.log(value);
}