
var Colors = {};
Colors.names = {
    darkorchid: "#9932cc",
    gold: "#ffd700",
    lightblue: "#add8e6",
    navy: "#000080",
    orange: "#ffa500",
    fuchsia: "#ff00ff",
    maroon: "#800000",
    lime: "#00ff00",
    darkkhaki: "#bdb76b",
    violet: "#800080",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgreen: "#006400",
    red: "#ff0000",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    lightcyan: "#e0ffff",
    darkorange: "#ff8c00",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkviolet: "#9400d3",
    darkgrey: "#a9a9a9",
    silver: "#c0c0c0",
    green: "#008000",
    aqua: "#00ffff",
    brown: "#a52a2a",
    black: "#000000",
    khaki: "#f0e68c",
    indigo: "#4b0082",
    lightgreen: "#90ee90",
    blue: "#0000ff",
    lightgrey: "#d3d3d3",
    lightpink: "#ffb6c1",
    lightyellow: "#ffffe0",
    magenta: "#ff00ff",
    olive: "#808000",
    pink: "#ffc0cb",
    purple: "#800080",
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
var isDragging = false;
// Generate the colors
var colors = null;
var updatePL = null;

d3.tsv("data/data.tsv", function (error, data) {
    var dataKeys = Object.keys(data[0]);
    console.log("Length = " + data.length);
    
    data.forEach(function (item) {
        var newItem = {};
        var ind = 0;
        dataKeys.forEach(function (key, i) {
            var val = +item[key];
            if ((item[key] != "") && !isNaN(val)) {
                newItem[key] = val;
            }
        });
        //personList.unshift(newItem);
    });
    
    dataKeys.forEach(function (key, i) {
        if (data[0][key] != "" && !isNaN(+data[0][key])) {
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
        item.values = keys.reduce(function (prev, current) { prev.push({ x0: x0, x1: x0 += +d[current], value: +d[current], name: current }); return prev; }, []);
        item.total = x0;
        item.id = personList.length;
        personList.unshift(item);
    });
    
    x2.domain([0, d3.max(personList, function (d) { return d.total; })]);
    y2.domain([0, data.length]);
    
    var drag = d3.behavior.drag()
    .on("drag", dragmove)
    .on("dragstart", function (d) { isDragging = true; })
    .on("dragend", dragend);
    //.origin(function (d, i) { return { x: 10, y: (personList.length-i) }; });

    colors = generateColors(keys);
    
    updatePersonList();
    
    var offset = radius + margin;
    var width = 2 * offset;
    
    var angleDelta = ((2 * Math.PI) / keys.length);
    var angle = 0;
    var index = 0;
    var max = 2 * Math.PI;
    while (angle < max) {
        lines[index] = [{ x: 0, y: 0 }, { x: (Math.cos(angle)), y: (Math.sin(angle)) }, keys[index]];
        index++;
        angle += angleDelta;
    }
    
    var windowWidth = $(window).width(),
        windowHeight = $(window).height();
    
    console.log(windowWidth + " " + windowHeight);
    
    // Legend creation
    var legendRadius = 10,
        legendMargin = 50;

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
        .attr("fill", function (d, i) { return colors[d]; })
        .attr("stroke-width", 3)
    
    d3.select("#chart").append("g")
        .attr("transform", "translate(" + (svg.node().getBBox().width + (3 * margin)) + "," + (2 * margin) + ")")
        .attr("id", "groupchart");
    
    var totalGroups = Math.floor((data.length) / 6);
    var maxCol = Math.floor(Math.sqrt(totalGroups)), maxRow = Math.ceil(totalGroups / maxCol);
    for (var c = 0; c < maxCol; c++) {
        for (var r = 0; r < maxRow && groupList.length < totalGroups; r++) {
            var gr = new Group("grouppath" + groupList.length, { x: c * (margin + (radius * 2)), y: r * (margin + (radius * 2)) });
            groupList.push(gr);
        }
    }
    
    var textHeight = 20;
    chart.append("g")
        .attr("id", "detailview")
        .append("rect")
        .attr("id", "colorrect")
        .attr("fill", "darkgray");
    d3.select("#detailview")
        .selectAll(".hovertext")
        .data(keys)
        .enter().append("text")
        .attr("fill", "white")
        .attr("transform", function (d, i) { return "translate(0," + (i * textHeight) + ")"; });
    
    
    function updatePersonList() {
        y2.domain([0, personList.length]);
        
        console.log("ID:"+personList.reduce(function(prev, curr) { prev.push(curr.id); return prev; }, []));

        var barHeight = 30;
        var stateSel = svg.selectAll(".state")
            .data(personList)
        
        var state = stateSel.enter()
        .append("g")
        .attr("class", "state")
        .call(drag)
        .on("mouseenter", function (d) {
            if (!isDragging) {
                var size = d3.mouse(d3.select("#chart").node());
                var text = d3.select("#detailview")
            .attr("transform", "translate(" + size[0] + "," + (size[1] + 30) + ")")
            .selectAll("text").text(function (p) { return p + " " + findSingleItem(d.values, "name", p).value; });
                
                //console.log(d3.mouse(d3.select("#chart").node()));
                var maxw = 0;
                text.each(function () {
                    if (this.getBBox().width > maxw) maxw = this.getBBox().width;
                });
                d3.select("#colorrect")
                .attr("width", maxw + 10)
                .attr("y", -20)
                .attr("height", (keys.length * textHeight) + 20);
                
                d3.select("#detailview")
                    .style("opacity", 1)
                    .transition()
                    .delay(5000)
                    .style("opacity", 0)
                    .style('pointer-events', 'none');
            }
        });
        
        stateSel.exit().remove();

        stateSel.attr("transform", function (d, i) { return "translate(0," + (50 * (personList.length - i)) + ")"; });
        
        state.selectAll("#text")
        .append("text")
        .attr("x", -15)
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function (d, i) { return d.id.toString(); })
        .attr("text-anchor", "start");
        state.selectAll("rect")
        .data(function (d) { return d.values; })
        .enter()
        .append("rect")
        .attr("width", function (d) { return x2(d.x1) - x2(d.x0); })
        .attr("x", function (d) { return x2(d.x0);})
        .attr("height", barHeight)
        .style("fill", function (d) { return colors[d.name]; });
    }
    
    updatePL = updatePersonList;

    function dragmove(d, i) {
        var x = d3.event.x;
        var y = d3.event.y;
        //console.log("drag " + x + " " + y + " " + i);
        //personList.splice(i, 1);
        //updatePersonList();
        d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
    }

    function dragend(d, i) {
        isDragging = false;
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

function findSingleItem(array, property, value){
    return array.filter(function (d) { return d[property] == value; }).shift();
}


function createRadarChart(data, offset, line, id) {
    var chart = d3.select("#groupchart")
        .append("g")
         .datum(data)
        .attr("class", "radarchart")
        .attr("transform", "translate(" + offset.x + "," + offset.y + ")")
        .on("mouseover", function (node) { selectedNode = node; })
        .on("mouseout", function (node) { selectedNode = null; })
        .on("contextmenu", function (d, i) {
            console.log(JSON.stringify(d));
        if (d.length > 0) {
            var group = groupList.filter(function (p) { return p.coordinates === d; }).shift();
            console.log(JSON.stringify(group.id));
            group.removeMember();
            updatePL();
        }
            //stop showing browser menu
            d3.event.preventDefault();
    });
    
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
         .attr("d", function (d) { return line([d[0], d[1]]); })
         .style("stroke", "gray");
    
    // Create the circles at the end of the lines, that represents the different keys ("questions")
    chart.append("g").selectAll(".typeCircle")
         .data(lines)
         .enter()
         .append("circle")
         .attr("cx", function (d) { return x(d[1].x); })
         .attr("cy", function (d) { return x(d[1].y); })
         .attr("r", 10)
         .attr("fill", function (d, i) { return colors[d[2]]; })
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

function generateColors(names) {
    var r = {}; // hold the generated colors
    var count = 0;
    for (var prop in Colors.names) {
        r[names[count++]]=(Colors.names[prop]);
        if (count >= names.length)
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
        updatePath.call(this);
    }
    this.removeMember = function () {
        var removed = this.members.pop();
        personList.push(removed);
        console.log("REMOVED FROM RADAR: " + JSON.stringify(removed));
        updatePath.call(this);
    }

    function updatePath(){
        if (this.members.length == 0) {
            this.coordinates.splice(0, this.coordinates.length);
        } else {
            var members = this.members;
            this.averageValues.forEach(function (item) {
                item.value = members.reduce(function (prev, current) { return prev + findSingleItem(current.values, "name", item.name).value; }, 0) / (members.length > 0?members.length:1);
            });
            
            console.log("AVERAGE: " + JSON.stringify(this.averageValues));
            updateCoordinates(this.averageValues, this.coordinates);
        }
        d3.select("#" + this.id)
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