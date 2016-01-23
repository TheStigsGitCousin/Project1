var express = require('express'),
    app = express(),
    port = process.env.PORT || 4000;
var d3 = require('d3');
var fs = require('fs');

//fs.readFile("data/data.tsv", "utf8", function (error, data) {
//    data = d3.tsv.parse(data);
//    console.log(JSON.stringify(data));
//});

app.use(express.static(__dirname + '/public'));
app.listen(port);