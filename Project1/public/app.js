
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

var selectedNode = null;
var detailData = [];

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
        //personList.unshift(newItem);
    });
    
    dataKeys.forEach(function (key, i) {
        if (data[0][key]!="" && !isNaN(+data[0][key])) {
            keys.push(key);
        }
    });
    
    
    var margin2 = { top: 20, right: 20, bottom: 30, left: 40 },
        width2 = 500 - margin2.left - margin2.right,
        height2 = (data.length * 50) + margin2.top + margin2.bottom;
    var chart = d3.select("#chart")
    .attr("width", $(window).width())
    .attr("height", height2);
    var svg = chart.append("g")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2)
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")")
    .attr("id", "scatterchart")
    
    var x2 = d3.scale.linear().range([0, width2]);
    var y2 = d3.scale.linear().rangeRound([height2, 0]);
    
    data.forEach(function (d) {
        var item = {};
        var x0 = 0;
        item.values = keys.reduce(function (prev, current) { prev[current] = +d[current]; x0 += (+d[current]); return prev; }, {});
        item.total = x0;
        item.id = personList.length;
        personList.unshift(item);
    });

    x2.domain([0, d3.max(personList, function (d) { return d.total; })]);
    y2.domain([0, data.length]);
    
    var drag = d3.behavior.drag()
    .on("drag", dragmove)
    .on("dragend", dragend);
    //.origin(function (d, i) { return { x: 10, y: (personList.length-i) }; });
    
    updatePersonList();
    
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
    var textLegend = legend.append("g").selectAll(".legendtext")
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
    //console.log(maxw);
    legend.append("g").selectAll(".legendCircle")
        .data(keys)
        .enter()
        .append("circle")
        .attr("cx", function (d, i) { return windowWidth - maxw - legendMargin - (2 * legendRadius); })
        .attr("cy", function (d, i) { return margin + (50 * i) - (legendRadius / 2); })
        .attr("r", legendRadius)
        .attr("fill", function (d, i) { return colors[i]; })
        .attr("stroke-width", 3)
    
    d3.select("#chart").append("g")
        .attr("transform", "translate(" + (svg.node().getBBox().width+(3*margin)) + ","+(2*margin)+")")
        .attr("id", "groupchart");
    
    var totalGroups = Math.floor((data.length) / 6);
    var maxCol = Math.floor(Math.sqrt(totalGroups)), maxRow = Math.ceil(totalGroups / maxCol);
    for (var c = 0; c < maxCol; c++) {
        for (var r = 0; r < maxRow && groupList.length<totalGroups; r++) {
            var gr = new Group("grouppath" + groupList.length, { x: c * (margin + (radius * 2)), y: r * (margin + (radius * 2)) });
            groupList.push(gr);
        }
    }
    
    var textHeight = 20;
    chart.append("g").attr("id", "detailview")
        .selectAll(".hovertext")
        .data(keys)
        .enter().append("text")
        .attr("fill", "red")
        .attr("transform", function (d, i) { return "translate(0," + (i * textHeight) + ")"; });
    
    function updatePersonList(){
        y2.domain([0, personList.length]);

        var barHeight = 30;
        var stateSel = svg.selectAll(".state")
            .data(personList)
        
        var state = stateSel.enter()
        .append("g")
        .attr("class", "state")
        .call(drag)
        .on("mouseenter", function (d) {
            d3.select("#detailview")
            .attr("transform", "translate(" + d3.mouse(d3.select("#chart").node()) + ")")
            .selectAll("text").text(function (p) { return p + " " + d.values[p];});
        });
        
        stateSel.exit().remove();

        stateSel.attr("transform", function (d, i) { return "translate(0," + (50 * (personList.length - i)) + ")"; });
        
        state.append("rect")
        .attr("width", function (d) { return x2(d.total); })
        .attr("x", 10)
        .attr("height", barHeight)
        .style("fill", "lightgray");
        state.append("text")
        .attr("x", 15)
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function (d, i) { return "Person " + d.id.toString() + " "+i+" " + " total score = " + d.total.toString(); })
        .attr("text-anchor", "start");
    }

    function dragmove(d, i) {
        var x = d3.event.x;
        var y = d3.event.y;
        //console.log("drag " + x + " " + y + " " + i);
        //personList.splice(i, 1);
        //updatePersonList();
        d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
    }

    function dragend(d, i) {
        if (selectedNode) {
            var person = personList.filter(function (p) { return p === d; })[0];
            var group = groupList.filter(function (p) { return p.coordinates === selectedNode; })[0];
            console.log("PERSON: " + JSON.stringify(person));
            group.addMember(person);
            var removed = personList.splice(i, 1);
            console.log("REMOVED: " + JSON.stringify(removed));
            console.log("REMOVED: " + personList.indexOf(removed[0]));
            updatePersonList();
        } else {
            d3.select(this).attr("transform", "translate(0,0)");
        }
        
    }

});


function createRadarChart(data, offset, line, id) {
    var chart = d3.select("#groupchart")
        .append("g")
         .datum(data)
        .attr("class", "radarchart")
        .attr("transform", "translate(" + offset.x + "," + offset.y + ")")
        .on("mouseover", function (node) { selectedNode = node; })
        .on("mouseout", function (node) { selectedNode = null; });
    
    chart.append("circle")
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
         .attr("cx", function (d) { return x(d[1].x); })
         .attr("cy", function (d) { return x(d[1].y); })
         .attr("r", 10)
         .attr("fill", function (d, i) { return colors[i]; })
         .attr("stroke-width", 3);
    
    chart.append("g")
         .append("path")
         .attr("id", id)
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
            .x(function (d) { return x(d.x); })
            .y(function (d) { return x(d.y); });

    this.averageValues = keys.reduce(function (prev, current) { prev.unshift({ name: current, value: 0 }); return prev; }, []);
    this.coordinates = [];
    this.members = [];
    this.id = id;
    this.radarChart = createRadarChart(this.coordinates, offset, this.line, id);
    this.addMember = function (person) {
        this.members.push(person);
        var members = this.members;
        this.averageValues.forEach(function (item) {
            item.value = members.reduce(function (prev, current) { return prev + current.values[item.name]; }, 0) / members.length;
        });

        console.log("AVERAGE: "+JSON.stringify(this.averageValues));
        updateCoordinates(this.averageValues, this.coordinates);
        d3.select("#"+this.id)
        .transition()
        .attr("d", this.line)
        .duration(1000)
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