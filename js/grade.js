// Set the dimensions of the canvas / graph
var margin = {top: 40, right: 30, bottom: 100, left: 70};
var revealIdentity = false;


var svg = d3.select("svg"),
    width = +document.getElementById("mainBody").offsetWidth-margin.left-margin.right,
    height = +svg.attr("height")-margin.top-margin.bottom;

svg = svg.append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Parse the date / time
var parseTime = d3.timeParse("%m/%d/%Y");

// Set the ranges
var x = d3.scaleTime().range([0, width-margin.left*2]);
var xNew = d3.scaleTime().range([0, width/2-margin.left]);

var y = d3.scaleLinear().range([height, 0]);
var yAxis= d3.scaleLinear().range([height, 0]);
var yP1domain = height*2.1;
var yPAxis = height*1.95;
var yP1= d3.scaleLinear().range([height, 60]).domain([0, 22]);
var yPA= d3.scaleLinear().range([yPAxis, 100]).domain([0, 22]);
let count = 0;

// Define the line
var valueline = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) {
        if (document.getElementById("checkboxP1").checked)
            return xNew(d.date);
        else
            return x(d.date); })
    .y(function(d) { return y(d.score); });

// Student info data
var data2 = {};
var groupCount = [{},{}];
d3.tsv("data/grade/grade.tsv").then(function(data_) {
    data_.forEach(function(d) {
        if (data2[d.Fullname]==undefined)
            data2[d.Fullname] = {};
        data2[d.Fullname] =d;
    });
    main();
});

// Force-directed layout
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("link", d3.forceLink().distance(2).strength(1))
    .force("charge", d3.forceManyBody().strength(-0.1));
//    .force("center", d3.forceCenter(width / 2, height / 2));
var simulationP1 = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("link", d3.forceLink().distance(2).strength(1))
    .force("charge", d3.forceManyBody().strength(-0.1));
var simulationP2 = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("link", d3.forceLink().distance(1).strength(1))
    .force("charge", d3.forceManyBody().strength(-0.1));
var simulationP3 = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("link", d3.forceLink().distance(1).strength(1))
    .force("charge", d3.forceManyBody().strength(-0.1));

var color = d3.scaleOrdinal(d3.schemeCategory10);
var radius = 5;

var node, link;
var nodeP1, linkP1, link01;
var nodeP2, linkP2, link02;
var nodeImage, nodeImageP1;
var dur=400;
// Force-directed layout
var nodes=[];
var nodes_search=[];
var P1_search=[];
var links=[];
var nodesP1=[];
var linksP1=[];
var nodesP2=[];
var linksP2=[];
var nodesP3=[];
var linksP3=[];
var today = new Date();
var data = {};

function getCategoty(str){
    if (str=="PhD")
        return 0;
    // else if (str=="BS")
    //     return 2;
    else
        return 1;
}

function main(){
    d3.tsv("data/grade/participations.tsv").then(function(data_) {
        // get time data
        let dataList =data_.columns;
        dataList.shift();
        dataList = dataList.map(d=>({key:d,time:parseTime(d)}));

        data_.forEach(function(d) {
            if (data[d.Students]==undefined)
                data[d.Students] = {};
            if (data[d.Students].array==undefined)
                data[d.Students].array= [];

            dataList.forEach(t=>{
                var object =  {};
                object.date = t.time;
                object.score = +d[t.key];
                data[d.Students].array.push(object);
            });

            data[d.Students].array.name = d.Students;
            data[d.Students].array.nickname =data2[d.Students].Nickname;
            data[d.Students].array.group = getCategoty(data2[d.Students].Program);

            data[d.Students].array.T1_score = parseFloat(data2[d.Students].T1_score);
            // data[d.Students].array.T1_audience = parseFloat(data2[d.Students].T1_audience);
            data[d.Students].array.P1_score = parseFloat(data2[d.Students].P1_score);
            data[d.Students].array.Final = parseFloat(data2[d.Students].Final);
            // data[d.Students].array.P1_audience = parseFloat(data2[d.Students].P1_audience?data2[d.Students].P1_audience:0);
            // data[d.Students].array.P1_teamEvaluation =
            //     parseFloat(data2[d.Students].P1_teamEvaluation?data2[d.Students].P1_teamEvaluation:0);
            //
            // data[d.Students].array.P2_sketch = parseFloat(data2[d.Students].P2_sketch?data2[d.Students].P2_sketch:0);
            // data[d.Students].array.P2_userStudy = parseFloat(data2[d.Students].P2_userStudy?data2[d.Students].P2_userStudy:0);
            data[d.Students].array.index = data[d.Students].array.length-1;
        });

        // Accumulate values
        for (var key in data){
            var arr = data[key].array;
            for (var i=0; i< arr.length; i++){
                if (i>0)
                    arr[i].score+=arr[i-1].score;
                arr.score= arr[i].score;  // Copy the final score to array
                arr.date = arr[i].date;
            }
        }

        // Make a new array
        var aData = [];
        for (var key in data){
            var arr = data[key].array
            aData.push(arr);
            // count group (students by program)
            if (groupCount[arr.group].count==undefined)
                groupCount[arr.group].count=0;
            groupCount[arr.group].count++;
            groupCount[arr.group].program = data2[key].Program;
        }
        // console.log(aData)
        today = aData[0][aData[0].length-1].date;
        // Scale the range of the data
        x.domain([aData[0][0].date,today]);
        xNew.domain([aData[0][0].date,today]);
        y.domain([0,Math.max(22,d3.max(Object.keys(data),k=>data[k].array.score))]);
        yAxis.domain([0, 0.2]);




        // Search student nicknam
        var optArray =[];
        for (var student in data2) {
            optArray.push(data2[student].Nickname);
        }
        optArray = optArray.sort();
        $(function () {
            $("#search").autocomplete({
                source: optArray
            });
        });

        // Draw color legend *************************
        svg.append("line")
            .attr("class", "legendLine10")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .style("stroke-dasharray", ("3, 3"))
            .attr("x1", 200)
            .attr("y1", y(20))
            .attr("x2", x(today))
            .attr("y2", y(20));

        svg.selectAll(".legendCircle")
            .data(groupCount).enter()
            .append("circle")
            .attr("class", "legendCircle")
            .attr("stroke", function(d,i) {
                return color(i);
            })
            .attr("stroke-width", 2)
            .attr("fill", function(d,i) {
                return color(i);
            })
            .attr("cx", 60)
            .attr("cy", function(d, i){ return 30+20*i})
            .attr("r", 7)
            .on("mouseover", mouseoverLegend)
            .on("mouseout", mouseoutLegend);

        svg.selectAll(".legendLine")
            .data(groupCount).enter()
            .append("line")
            .attr("class", "legendLine")
            .attr("stroke", function(d,i) {
                return color(i);
            })
            .attr("stroke-width", 2)
            .attr("fill", "#fff")
            .attr("x1", 40)
            .attr("y1", function(d, i){ return 30+20*i})
            .attr("x2", 62)
            .attr("y2", function(d, i){ return 30+20*i});

        svg.selectAll(".legendText")
            .data(groupCount).enter()
            .append("text")
            .attr("class", "legendText")
            .style("font-size", "15px")
            .attr("text-anchor", "left")
            .attr("fill", function(d,i) {return color(i); })
            .attr("x", 80+radius)
            .attr("y", function(d, i){ return 36+20*i})
            .text(function(d){
                return d.program + " ("+d.count+" students)"})
            .on("mouseover", mouseoverLegend)
            .on("mouseout", mouseoutLegend);

        function mouseoverLegend(d1){
            svg.selectAll(".legendText")
                .attr("fill-opacity", function (d2){
                    return d1.program==d2.program ? 1 : 0.1; });
            svg.selectAll(".legendLine")
                .attr("stroke-opacity", function (d2){
                    return d1.program==d2.program ? 1 : 0.1; });
            svg.selectAll(".legendCircle")
                .attr("fill-opacity", function (d2){
                    return d1.program==d2.program ? 1 : 0.1; });
            svg.selectAll(".lineGraph")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){
                    return getCategoty(d1.program)==d2.group ? 1 : 0.05; });
            svg.selectAll(".nodeImage")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){
                    return getCategoty(d1.program)==d2.group ? 1 : 0.05; })
                .attr("fill-opacity", function (d2){
                    return getCategoty(d1.program)==d2.group ? 1 : 0.1; });
            svg.selectAll(".nodeImageP1")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){
                    if (!document.getElementById("checkboxP1").checked) return 0;
                    return getCategoty(d1.program)==d2.group ? 1 : 0.05; })
                .attr("fill-opacity", function (d2){
                    if (!document.getElementById("checkboxP1").checked) return 0;
                    return getCategoty(d1.program)==d2.group ? 1 : 0.1; });
            svg.selectAll(".nodeCircle")
                .transition().duration(dur)
                .attr("fill-opacity", function (d2){
                    return getCategoty(d1.program)==d2.group ? 1 : 0.1; });
            if (document.getElementById("checkboxP1").checked) {
                svg.selectAll(".nodeP1")
                    .transition().duration(dur)
                    .attr("stroke-opacity", function (d2){
                        return getCategoty(d1.program)==d2.group ? 1 : 0.05; })
                    .attr("fill-opacity", function (d2){
                        return getCategoty(d1.program)==d2.group ? 1 : 0.1; });

                svg.selectAll(".nodeP2")
                    .transition().duration(dur)
                    .attr("stroke-opacity", function (d2){
                        return getCategoty(d1.program)==d2.group ? 1 : 0.05; })
                    .attr("fill-opacity", function (d2){
                        return getCategoty(d1.program)==d2.group ? 1 : 0.1; });

                svg.selectAll(".nodeP3")
                    .transition().duration(dur)
                    .attr("stroke-opacity", function (d2){
                        return getCategoty(d1.program)==d2.group ? 1 : 0.05; })
                    .attr("fill-opacity", function (d2){
                        return getCategoty(d1.program)==d2.group ? 1 : 0.1; });
            }
            else{
                svg.selectAll(".nodeP1")
                    .transition().duration(dur)
                    .attr("fill-opacity", 0);
                svg.selectAll(".nodeP2")
                    .transition().duration(dur)
                    .attr("fill-opacity", 0);

                svg.selectAll(".nodeP3")
                    .transition().duration(dur)
                    .attr("fill-opacity", 0);
            }
            svg.selectAll(".links")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){ return getCategoty(d1.program)==d2.source.group ? 1 : 0.1; });
            svg.selectAll(".linksP1")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){ return getCategoty(d1.program)==d2.source.group ? 1 : 0.1; });
            svg.selectAll(".links01")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){ return getCategoty(d1.program)==d2.source.group ? 1 : 0.1; });
            svg.selectAll(".linksP2")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){ return getCategoty(d1.program)==d2.source.group ? 1 : 0.1; });
            svg.selectAll(".links02")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){ return getCategoty(d1.program)==d2.source.group ? 1 : 0.1; });
            svg.selectAll(".linksP3")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){ return getCategoty(d1.program)==d2.source.group ? 1 : 0.1; });
            svg.selectAll(".links03")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){ return getCategoty(d1.program)==d2.source.group ? 1 : 0.1; });

        }
        function mouseoutLegend(d1){
            svg.selectAll(".legendText")
                .attr("fill-opacity", 1);
            svg.selectAll(".legendLine")
                .attr("stroke-opacity", 1);
            svg.selectAll(".legendCircle")
                .attr("fill-opacity", 1);
            svg.selectAll(".lineGraph")
                .transition().duration(dur)
                .attr("stroke-opacity", 1);
            svg.selectAll(".nodeImage")
                .transition().duration(dur)
                .attr("stroke-opacity", 1)
                .attr("fill-opacity", 1);
            svg.selectAll(".links")
                .transition().duration(dur)
                .attr("stroke-opacity", 1);
            svg.selectAll(".nodeCircle")
                .transition().duration(dur)
                .attr("fill-opacity", 1);

            if (document.getElementById("checkboxP1").checked){
                svg.selectAll(".nodeImageP1")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1)
                    .attr("fill-opacity", 1);
                svg.selectAll(".nodeP1")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1)
                    .attr("fill-opacity", 1);
                svg.selectAll(".linksP1")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1);
                svg.selectAll(".links01")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1);
                svg.selectAll(".nodeImageP2")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1)
                    .attr("fill-opacity", 1);
                svg.selectAll(".nodeP2")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1)
                    .attr("fill-opacity", 1);
                svg.selectAll(".linksP2")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1);
                svg.selectAll(".links02")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1);

                svg.selectAll(".nodeImageP3")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1)
                    .attr("fill-opacity", 1);
                svg.selectAll(".nodeP3")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1)
                    .attr("fill-opacity", 1);
                svg.selectAll(".linksP3")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1);
                svg.selectAll(".links03")
                    .transition().duration(dur)
                    .attr("stroke-opacity", 1);
            }
        }
        // Draw title *******************************
        svg.append("text")
            .attr("class", "title1")
            .style("font-size", "22px")
            .attr("text-anchor", "left")
            .attr("fill", "#000")
            .attr("x", margin.left-30)
            .attr("y", 0)
            .text("Class scores");

        // Draw Label for yAxis *******************************
        svg.append("text")
            .attr("class", "title")
            .style("font-size", "17px")
            .attr("text-anchor", "middle")
            .attr("fill", "#000")
            .attr("x", width/2-100)
            .attr("y", height+margin.top)
            .text("Date");

        svg.selectAll(".lineGraph")
            .data(aData).enter()
            .append("path")
            .attr("class", "lineGraph")
            .attr("stroke-width", 1)
            .attr("stroke", function(d) {
                return color(d.group);
            })
            .attr("d", function(d) {
                return valueline(d);
            });

        // Add the x Axis
        svg.append("g")
            .attr("class", "xAxis")
            .style("font-size", "14px")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the y Axis
        axis = yAxis.copy();
        axis.domain([0,Math.max(22,d3.max(Object.keys(data),k=>data[k].array.score))/100]);
        svg.append("g")
            .style("font-size", "14px")
            .call(d3.axisLeft(axis).ticks(12, "%"));

        // Append xAxis label
        svg.append("text")
            .style("fill", "black")
            .style("font-size", "17px")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(-52,"+height/2+") rotate(-90)")
            .text("Percentage of participations in student's final grade");

        for (var i=0; i<aData.length;i++){
            var nod1 = {};
            nod1.name = aData[i].name;
            nod1.nickname = aData[i].nickname;
            nod1.group = aData[i].group;
            nod1.score = aData[i].score;
            nod1.date = aData[i].date;
            nod1.image = aData[i].image;
            nodes.push(nod1);
            nodes_search.push({
                'value':nod1.nickname,
                'data':nod1.score,
                'score':aData[i].T1_score,
                // 'audience':aData[i].T1_audience
            });
            // console.log(nodes_search);


            var nod2 = {};
            nod2.name = aData[i].name;
            nod2.nickname = aData[i].nickname;
            nod2.group = aData[i].group;
            nod2.score = aData[i].score;
            nod2.date = aData[i].date;
            nod2.image = aData[i].image;
            nodes.push(nod2);

            var lin = {};
            lin.source = nod1;
            lin.target = nod2;
            lin.group = nod1.group;
            links.push(lin);

            // PROJECT 1
            var nodeP11 = {};
            nodeP11.name = aData[i].name;
            nodeP11.nickname = aData[i].nickname;
            nodeP11.group = aData[i].group;
            nodeP11.score = aData[i].score;
            nodeP11.T1_score = aData[i].T1_score;
            // nodeP11.T1_audience = aData[i].T1_audience;
            // nodeP11.P1_report = aData[i].P1_report;
            nodeP11.date = aData[i].date;
            nodeP11.image = aData[i].image;
            nodesP1.push(nodeP11);




            var nodeP12 = {};
            nodeP12.name = aData[i].name;
            nodeP12.nickname = aData[i].nickname;
            nodeP12.group = aData[i].group;
            nodeP12.score = aData[i].score;
            nodeP12.T1_score = aData[i].T1_score;
            // nodeP12.T1_audience = aData[i].T1_audience;
            // nodeP12.P1_report = aData[i].P1_report;
            nodeP12.date = aData[i].date;
            nodeP12.image = aData[i].image;
            nodesP1.push(nodeP12);

            var linP1 = {};
            linP1.source = nodeP11;
            linP1.target = nodeP12;
            linP1.group = nodeP11.group;
            linksP1.push(linP1);

            // PROJECT 2 (Project 1)
            var nodeP21 = {};
            nodeP21.name = aData[i].name;
            nodeP21.nickname = aData[i].nickname;
            nodeP21.group = aData[i].group;
            nodeP21.score = aData[i].score;
            nodeP21.P1_score = aData[i].P1_score;
            nodeP21.P1_audience = aData[i].P1_audience;
            nodeP21.P1_teamEvaluation = aData[i].P1_teamEvaluation;

            // nodeP21.P2_talk = aData[i].P2_talk;
            // nodeP21.P2_report = aData[i].P2_report;
            // nodeP21.P2_review = aData[i].P2_review;
            nodeP21.date = aData[i].date;
            nodeP21.image = aData[i].image;
            nodesP2.push(nodeP21);

            var nodeP22 = {};
            nodeP22.name = aData[i].name;
            nodeP22.nickname = aData[i].nickname;
            nodeP22.group = aData[i].group;
            nodeP22.score = aData[i].score;
            nodeP22.P1_score = aData[i].P1_score;
            nodeP22.P1_audience = aData[i].P1_audience;
            nodeP22.P1_teamEvaluation = aData[i].P1_teamEvaluation;

            if (aData[i].P1_score) {
                count +=1;
            }
            // nodeP22.P2_talk = aData[i].P2_talk;
            // nodeP22.P2_report = aData[i].P2_report;
            // nodeP22.P2_review = aData[i].P2_review;
            nodeP22.date = aData[i].date;
            nodeP22.image = aData[i].image;
            nodesP2.push(nodeP22);

            var linP2 = {};
            linP2.source = nodeP21;
            linP2.target = nodeP22;
            linP2.group = nodeP21.group;
            linksP2.push(linP2);

            // PROJECT 3 (Project 2)
            var nodeP31 = {};
            nodeP31.name = aData[i].name;
            nodeP31.nickname = aData[i].nickname;
            nodeP31.group = aData[i].group;
            nodeP31.score = aData[i].score;
            nodeP31.Final = aData[i].Final;
            nodeP31.date = aData[i].date;
            nodeP31.image = aData[i].image;
            nodesP3.push(nodeP31);

            var nodeP32 = {};
            nodeP32.name = aData[i].name;
            nodeP32.nickname = aData[i].nickname;
            nodeP32.group = aData[i].group;
            nodeP32.score = aData[i].score;
            nodeP32.Final = aData[i].Final;
            nodeP32.date = aData[i].date;
            nodeP32.image = aData[i].image;
            nodesP3.push(nodeP32);

            var linP3 = {};
            linP3.source = nodeP31;
            linP3.target = nodeP32;
            linP3.group = nodeP31.group;
            linksP3.push(linP3);
        }

        // Compute the summary
        var countA =0;
        var countB =0;
        var countC =0;
        for (var i=0;i<nodesP2.length;i=i+2){
            var p0 = nodes[i].score;
            if (p0>10)
                p0=10;
            var p1 = nodesP1[i].T1_score||0;
            var p2 = nodesP2[i].P1_score;
            var p3 = nodesP3[i].Final;
            // +nodesP3[i].P3_talk+nodesP3[i].P3_report +nodesP3[i].P3_review;
            var sum= p0+p1+p2+p3;
            var finalGrade = " ";
            if (sum>=85){
                countA++;
                finalGrade = "A";
            }
            else if (sum>=70){
                finalGrade = "B";
                countB++;
            }
            else if (sum>=55){
                countC++;
                finalGrade = "C";
            }
            // console.log( finalGrade+ " name="+nodesP1[i].name+" sum="+sum);
        }
        // console.log("countA="+countA+" countB="+countB +" countC="+countC);
        link = svg.selectAll(".links")
            .data(links)
            .enter().append("line")
            .attr("class", "links")
            .attr("stroke", function(d){
                return color(d.group);
            })
            .attr("stroke-width",1.5);
        linkP1 = svg.selectAll(".linksP1")
            .data(linksP1)
            .enter().append("line")
            .attr("class", "linksP1")
            .attr("stroke", function(d){
                return color(d.group);
            })
            .attr("stroke-width",1.5);

        linkP2 = svg.selectAll(".linksP2")
            .data(linksP2)
            .enter().append("line")
            .attr("class", "linksP2")
            .attr("stroke", function(d){
                return color(d.group);
            })
            .attr("stroke-width",1.5);

        linkP3 = svg.selectAll(".linksP3")
            .data(linksP2)
            .enter().append("line")
            .attr("class", "linksP3")
            .attr("stroke", function(d){
                return color(d.group);
            })
            .attr("stroke-width",1);

        link01 = svg.selectAll(".links01")
            .data(links)
            .enter().append("line")
            .attr("class", "links01")
            .attr("stroke", function(d){ return color(d.group);})
            .attr("stroke-width",1);

        link02 = svg.selectAll(".links02")
            .data(links)
            .enter().append("line")
            .attr("class", "links02")
            .attr("stroke", function(d){ return color(d.group);})
            .attr("stroke-width", function(d){
                // console.log(d.source.name);
                return d.source.name=="Sara Sartoli" ? 0 : 1;
            });

        link03 = svg.selectAll(".links03")
            .data(links)
            .enter().append("line")
            .attr("class", "links03")
            .attr("stroke", function(d){ return color(d.group);})
            .attr("stroke-width", function(d){
                // console.log(d.source.name);
                return d.source.name=="Sara Sartoli" ? 0 : 1;
            });

        node = svg.selectAll(".nodeCircle")
            .data(nodes)
            .enter().append("circle")
            .attr("class","nodeCircle")
            .attr("r", function(d,i) {
                if (i%2==0)
                    return 0;
                else
                    return radius+1;
            })
            .attr("fill", function(d,i) {
                if (i%2==0)
                    return "#110";
                else
                    return color(d.group);
            })
            .on("mouseover", mouseoverNode)
            .on("mouseout", mouseoutNode)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        nodeP1 = svg.selectAll(".nodeP1")
            .data(nodesP1)
            .enter().append("circle")
            .attr("class","nodeP1")
            .attr("r", function(d,i) {
                if (i%2==0)
                    return 0;
                else
                    return radius+1;
            })
            .attr("fill", function(d,i) {
                if (i%2==0)
                    return "#110";
                else
                    return color(d.group);
            })
            .on("mouseover", mouseoverNode)
            .on("mouseout", mouseoutNode)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        nodeP2 = svg.selectAll(".nodeP2")
            .data(nodesP2)
            .enter().append("circle")
            .attr("class","nodeP2")
            .attr("r", function(d,i) {
                if (i%2==0)
                    return 0;
                else
                    return radius+1;
            })
            .attr("fill", function(d,i) {
                if (i%2==0)
                    return "#110";
                else
                    return color(d.group);
            })
            .on("mouseover", mouseoverNode)
            .on("mouseout", mouseoutNode)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        nodeP3 = svg.selectAll(".nodeP3")
            .data(nodesP3)
            .enter().append("circle")
            .attr("class","nodeP3")
            .attr("r", function(d,i) {
                if (i%2==0)
                    return 0;
                else
                    return radius+1;
            })
            .attr("fill", function(d,i) {
                if (i%2==0)
                    return "#110";
                else
                    return color(d.group);
            })
            .on("mouseover", mouseoverNode)
            .on("mouseout", mouseoutNode)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        for (var i=0;i<nodes.length;i++){
            var imgurl = "http://wallpapers.androlib.com/wallicons/wallpaper.big-pqC.cs.png"
            var defs = svg.append("defs").attr("id", "imgdefs")
            var catpattern = defs.append("pattern")
                .attr("id", "catpattern"+i)
                .attr("height", 1)
                .attr("width", 1)
                .attr("x", "0")
                .attr("y", "0")

        }



        if (revealIdentity){
            nodeImageP1 = svg.selectAll(".nodeImageP1")
                .data(nodesP1).enter()
                .append("circle")
                .attr("class", "nodeImageP1")
                .attr("r", radius)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .style("fill", function(d,i) {
                    if (i%2==1)
                        return "url(#catpattern"+i+")";
                    else
                        return "none";

                })
                .attr("stroke-width",2)
                .attr("stroke", function(d,i) {
                    if (i%2==0)
                        return "none";
                    else
                        return color(d.group);
                })
                .on("mouseover", mouseoverNode)
                .on("mouseout", mouseoutNode)
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            nodeImage = svg.selectAll(".nodeImage")
                .data(nodes).enter()
                .append("circle")
                .attr("class", "nodeImage")
                .attr("r", radius)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .style("fill", function(d,i) {
                    if (i%2==1)
                        return "url(#catpattern"+i+")";
                    else
                        return "none";
                })
                .attr("stroke-width",2)
                .attr("stroke", function(d,i) {
                    if (i%2==0)
                        return "none";
                    else
                        return color(d.group);
                })
                .on("mouseover", mouseoverNode)
                .on("mouseout", mouseoutNode)
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            nodeImage.append("title")
                .text(function(d) { return d.name; });
        }
        else {
            node.append("title")
                .text(function(d) { return d.nickname; });
            nodeP1.append("title")
                .text(function(d) { return d.nickname; });
            nodeP2.append("title")
                .text(function(d) { return d.nickname; });
            nodeP3.append("title")
                .text(function(d) { return d.nickname; });
        }








        fadeP1();


        simulation
            .nodes(nodes)
            .on("tick", ticked);
        simulation.force("link")
            .links(links);
        simulation.force("collide", d3.forceCollide(function(d,i){
            if (i%2==0)
                return 0;
            else
                return radius+1;
        }));
        simulation.alpha(0.25);


        simulationP1
            .nodes(nodesP1)
            .on("tick", tickedT1);
        simulationP1.force("link")
            .links(linksP1);
        simulationP1.force("collide", d3.forceCollide(function(d,i){
            if (i%2==0)
                return 0;
            else
                return radius+1;
        }));

        simulationP2
            .nodes(nodesP2)
            .on("tick", tickedP2);
        simulationP2.force("link")
            .links(linksP2);
        simulationP2.force("collide", d3.forceCollide(function(d,i){
            if (i%2==0)
                return 0;
            else
                return radius+1;
        }));
        //
        simulationP3
            .nodes(nodesP3)
            .on("tick", tickedP3);
        simulationP3.force("link")
            .links(linksP3);
        simulationP3.force("collide", d3.forceCollide(function(d,i){
            if (i%2==0)
                return 0;
            else
                return radius+1;
        }));

    });
}

function textContribution(index){
    svg.append("text")
        .attr("class", "textContribution")
        .style("font-size", "13px")
        .attr("text-anchor", "left")
        .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
        .attr("fill", "#000")
        .attr("x", radius+nodes[index].x+5)
        .attr("y", nodes[index].y+3)
        .text("Contribution: " +nodes[index].score+"% " +nodes[index].nickname)


}

function textP1(index){
    svg.append("text")
        .attr("class", "textP1")
        .style("font-size", "13px")
        .attr("text-anchor", "left")
        .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
        .attr("fill", "#000")
        .attr("x", radius+nodesP1[index].x+12 ? radius+nodesP1[index].x+12 : 0)
        .attr("y", nodesP1[index].y-12 ? nodesP1[index].y-12 : 0)
        .text("T1 score: "+($.isNumeric(nodesP1[index].T1_score) ? (nodesP1[index].T1_score + "%") : "N/A"));

    // svg.append("text")
    //     .attr("class", "textP1")
    //     .style("font-size", "13px")
    //     .attr("text-anchor", "left")
    //     .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
    //     .attr("fill", "#000")
    //     .attr("x", radius+nodesP1[index].x+20 ? radius+nodesP1[index].x+20 :0)
    //     .attr("y", nodesP1[index].y+3 ? nodesP1[index].y+3 : 0)
    //     .text("T1 audience evaluation: "+($.isNumeric(nodesP1[index].T1_audience) ? (nodesP1[index].T1_audience + "%") : "N/A"));


    // Project 1
    svg.append("text")
        .attr("class", "textP2")
        .style("font-size", "13px")
        .attr("text-anchor", "left")
        .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
        .attr("fill", "#000")
        .attr("x", radius+nodesP2[index].x+14)
        .attr("y", nodesP2[index].y+4)
        .text("P1 score: "+(nodesP2[index].P1_score ? nodesP2[index].P1_score + "%" : "N/A"));

    //
    //  // Project 2
    svg.append("text")
        .attr("class", "textP3")
        .style("font-size", "13px")
        .attr("text-anchor", "left")
        .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
        .attr("fill", "#000")
        .attr("x", radius+nodesP3[index].x+12)
        .attr("y", nodesP3[index].y-12)
        .text("Final: "+nodesP3[index].Final+"%");


    // svg.append("text")
    //   .attr("class", "textP3")
    //   .style("font-size", "13px")
    //   .attr("text-anchor", "left")
    //   .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
    //   .attr("fill", "#000")
    //   .attr("x", radius+nodesP3[index].x+5)
    //   .attr("y", nodesP3[index].y+18)
    //   .text("Report: "+nodesP3[index].P3_report+"%");
    // svg.append("text")
    //   .attr("class", "textP3")
    //   .style("font-size", "13px")
    //   .attr("text-anchor", "left")
    //   .style("text-shadow", "1px 1px 0 rgba(200, 200, 200, 0.9")
    //   .attr("fill", "#000")
    //   .attr("x", radius+nodesP3[index].x+5)
    //   .attr("y", nodesP3[index].y+33)
    //   .text("Review: "+nodesP3[index].P3_review+"%");
}

function searchNode() {
    //searchTerm = document.getElementById('search').value;
    var obj ={};
    obj.nickname = document.getElementById('search').value;
    for (var i=0;i<nodes.length;i++){
        if (obj.nickname==nodes[i].nickname && nodes[i].index!=undefined){
            obj.index = nodes[i].index;
            obj.name = nodes[i].name;
        }
    }
    mouseoutNode(obj);
    mouseoverNode(obj);

}

function mouseoverNode(d1){
    //if (d1.P1_code!=undefined && !document.getElementById("checkboxP1").checked)
    //   return;
    svg.selectAll(".lineGraph")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){ return d1.name==d2.name ? 1 : 0.05; });
    svg.selectAll(".nodeImage")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){ return d1.name==d2.name ? 1 : 0.05; })
        .attr("fill-opacity", function (d2){ return d1.name==d2.name ? 1 : 0.1; });
    if (revealIdentity){
        svg.selectAll(".nodeImageP1")
            .transition().duration(dur)
            .attr("stroke-opacity", function (d2){
                if (!document.getElementById("checkboxP1").checked) return 0;
                return d1.name==d2.name ? 1 : 0.05; })
            .attr("fill-opacity", function (d2){
                if (!document.getElementById("checkboxP1").checked) return 0;
                return d1.name==d2.name ? 1 : 0.1; });
        svg.selectAll(".nodeCircle")
            .transition().duration(dur)
            .attr("fill-opacity", 0);
    }
    else{
        //debugger;
        svg.selectAll(".nodeCircle")
            .transition().duration(dur)
            .attr("stroke-opacity", function (d2){
                //  if (!document.getElementById("checkboxP1").checked) return 0;
                return d1.name==d2.name ? 1 : 0.05; })
            .attr("fill-opacity", function (d2){
                //  if (!document.getElementById("checkboxP1").checked) return 0;
                return d1.name==d2.name ? 1 : 0.1; });
        if (document.getElementById("checkboxP1").checked){
            svg.selectAll(".nodeP1")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){
                    //  if (!document.getElementById("checkboxP1").checked) return 0;
                    return d1.name==d2.name ? 1 : 0.05; })
                .attr("fill-opacity", function (d2){
                    //  if (!document.getElementById("checkboxP1").checked) return 0;
                    return d1.name==d2.name ? 1 : 0.1; });

            //Project 2
            svg.selectAll(".nodeP2")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){
                    //  if (!document.getElementById("checkboxP1").checked) return 0;
                    return d1.name==d2.name ? 1 : 0.05; })
                .attr("fill-opacity", function (d2){
                    //  if (!document.getElementById("checkboxP1").checked) return 0;
                    return d1.name==d2.name ? 1 : 0.1; });

            // Project 3
            svg.selectAll(".nodeP3")
                .transition().duration(dur)
                .attr("stroke-opacity", function (d2){
                    // if (!document.getElementById("checkboxP1").checked) return 0;
                    return d1.name==d2.name ? 1 : 0.05; })
                .attr("fill-opacity", function (d2){
                    // if (!document.getElementById("checkboxP1").checked) return 0;
                    return d1.name==d2.name ? 1 : 0.1; });
        }

    }

    svg.selectAll(".links")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){ return d1.name==d2.source.name ? 1 : 0.1; });
    svg.selectAll(".linksP1")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){
            if (!document.getElementById("checkboxP1").checked) return 0;
            return d1.name==d2.source.name ? 1 : 0.1; });
    svg.selectAll(".links01")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){
            if (!document.getElementById("checkboxP1").checked) return 0;
            return d1.name==d2.source.name ? 1 : 0.1; });

    svg.selectAll(".linksP2")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){
            if (!document.getElementById("checkboxP1").checked) return 0;
            return d1.name==d2.source.name ? 1 : 0.1; });
    svg.selectAll(".linksP3")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){
            if (!document.getElementById("checkboxP1").checked) return 0;
            return d1.name==d2.source.name ? 1 : 0.1; });
    svg.selectAll(".links02")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){
            if (!document.getElementById("checkboxP1").checked) return 0;
            return d1.name==d2.source.name ? 1 : 0.1; });
    svg.selectAll(".links03")
        .transition().duration(dur)
        .attr("stroke-opacity", function (d2){
            if (!document.getElementById("checkboxP1").checked) return 0;
            return d1.name==d2.source.name ? 1 : 0.1; });

    if (document.getElementById("checkboxP1").checked){
        textP1(d1.index);
    }
    textContribution(d1.index);
}

function mouseoutNode(d1){
    svg.selectAll(".lineGraph")
        .transition().duration(dur)
        .attr("stroke-opacity", 1);
    svg.selectAll(".nodeImage")
        .transition().duration(dur)
        .attr("stroke-opacity", 1)
        .attr("fill-opacity", 1); ;
    svg.selectAll(".nodeCircle")
        .transition().duration(dur)
        .attr("stroke-opacity", 1)
        .attr("fill-opacity", 1);

    if (document.getElementById("checkboxP1").checked){
        svg.selectAll(".nodeP1")
            .transition().duration(dur)
            .attr("stroke-opacity", 1)
            .attr("fill-opacity", 1);
        svg.selectAll(".nodeP2")
            .transition().duration(dur)
            .attr("stroke-opacity", 1)
            .attr("fill-opacity", 1);
        svg.selectAll(".nodeP3")
            .transition().duration(dur)
            .attr("stroke-opacity", 1)
            .attr("fill-opacity", 1);
    }
    svg.selectAll(".links")
        .transition().duration(dur)
        .attr("stroke-opacity", 1);
    if (document.getElementById("checkboxP1").checked){
        svg.selectAll(".linksP1")
            .transition().duration(dur)
            .attr("stroke-opacity", 1);
        svg.selectAll(".linksP2")
            .transition().duration(dur)
            .attr("stroke-opacity", 1);
        svg.selectAll(".linksP3")
            .transition().duration(dur)
            .attr("stroke-opacity", 1);

        svg.selectAll(".nodeImageP1")
            .transition().duration(400)
            .attr("fill-opacity",function(d){
                return (d.name.indexOf("Manasa")<0 && d.name.indexOf("Paul")<0)? 1 : 0;})
            .attr("stroke-opacity",function(d){
                return (d.name.indexOf("Manasa")<0 && d.name.indexOf("Paul")<0)? 1 : 0;});
        svg.selectAll(".links01")
            .transition().duration(400)
            .attr("stroke-opacity",function(d){
                return (d.source.name.indexOf("Manasa")<0 && d.source.name.indexOf("Paul")<0)? 1 : 0;
            });
        svg.selectAll(".links02")
            .transition().duration(400)
            .attr("stroke-opacity",function(d){
                return (d.source.name.indexOf("Manasa")<0 && d.source.name.indexOf("Paul")<0)? 1 : 0;
            });
        svg.selectAll(".links03")
            .transition().duration(400)
            .attr("stroke-opacity",function(d){
                return (d.source.name.indexOf("Manasa")<0 && d.source.name.indexOf("Paul")<0)? 1 : 0;
            });
    }
    svg.selectAll(".textP1").remove();
    svg.selectAll(".textP2").remove();
    svg.selectAll(".textP3").remove();
    svg.selectAll(".textContribution").remove();
}

let firstGroupX = width/2-margin.left;
let secondGroupX = width*0.63;
let thirdGroupX = width*0.8;
let fourthGroupX = width*0.95;
let groupY = 30;

function ticked() {
    for (var i=0;i<nodes.length;i=i+2){
        if (document.getElementById("checkboxP1").checked)
            // && nodes[i].name.indexOf("Manasa")<0 && nodes[i].name.indexOf("Paul")<0)
            nodes[i].x = xNew(today);
        else
            nodes[i].x = x(nodes[i].date);
        nodes[i].y = y(nodes[i].score);
    }
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    if (revealIdentity){
        nodeImage
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }
}

function tickedT1() {
    for (var i=0;i<nodesP1.length;i=i+2){
        if (document.getElementById("checkboxP1").checked){
            nodesP1[i].x = secondGroupX;
            if ((nodesP1[i].T1_score)){
                nodesP1[i].y = yP1((nodesP1[i].T1_score)*20/30)
            }
            else {
                nodesP1[i].y = yP1(0);
            }
        }
        else{
            nodesP1[i].x = x(nodesP1[i].date);
            nodesP1[i].y = y(nodesP1[i].score);
        }

    }
    linkP1
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    link01
        .attr("x1", function(d,i) { return nodes[i*2+1].x; })
        .attr("y1", function(d,i) { return nodes[i*2+1].y; })
        .attr("x2", function(d,i) { return nodesP1[i*2+1].x; })
        .attr("y2", function(d,i) { return nodesP1[i*2+1].y; });

    nodeP1
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    if (revealIdentity){
        nodeImageP1
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }
}


function tickedP2() {
    for (var i=0;i<nodesP2.length;i=i+2){
        if (document.getElementById("checkboxP1").checked){
            nodesP2[i].x = thirdGroupX;
            var exist = !!(nodesP2[i].P1_score);
            var yy = (nodesP2[i].P1_score+nodesP2[i].P1_audience + nodesP2[i].P1_teamEvaluation);
            // +nodesP2[i].P2_talk+nodesP2[i].P2_report  +nodesP2[i].P2_review;
            // console.log(yy)
            nodesP2[i].y = exist? yP1(yy/33*22): yP1(0);  // 35% compared to 20%
        }
        else{
            nodesP2[i].x = x(nodesP2[i].date);
            nodesP2[i].y = y(nodesP2[i].score);
        }

    }
    linkP2
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    link02
        .attr("x1", function(d,i) { return nodesP1[i*2+1].x; })
        .attr("y1", function(d,i) { return nodesP1[i*2+1].y; })
        .attr("x2", function(d,i) { return nodesP2[i*2+1].x; })
        .attr("y2", function(d,i) { return nodesP2[i*2+1].y; });

    nodeP2
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
}

function tickedP3() {
    for (var i=0;i<nodesP3.length;i=i+2){
        if (document.getElementById("checkboxP1").checked){
            nodesP3[i].x = fourthGroupX;
            var yy = nodesP3[i].Final
            // +nodesP3[i].P3_talk+nodesP3[i].P3_report +nodesP3[i].P3_review;

            nodesP3[i].y = yy? yP1(yy*20/30) : yP1(0);  // 5% compared to 22%

            function getY(yy){
                if (yy === 11){
                    return yP1(yy/11.35*22)
                }
                else if (yy >= 6){
                    return yP1(yy/11*22)
                }
                else return yP1(2.8/5*22)
            }
        }
        else{
            nodesP3[i].x = x(nodesP3[i].date);
            nodesP3[i].y = y(nodesP3[i].score);
        }

    }
    linkP3
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    link03
        .attr("x1", function(d,i) { return nodesP2[i*2+1].x; })
        .attr("y1", function(d,i) { return nodesP2[i*2+1].y; })
        .attr("x2", function(d,i) { return nodesP3[i*2+1].x; })
        .attr("y2", function(d,i) { return nodesP3[i*2+1].y; });

    nodeP3
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
}

function showP1(){
    // This is to make sure that all object are reset to opacity =1
    // var obj ={};
    // obj.nickname = nodes[0].nickname;
    // obj.index = nodes[0].index;
    // obj.name = nodes[0].name;
    // mouseoutNode(obj);

    // Add the x Axis
    if (document.getElementById("checkboxP1").checked){
        svg.selectAll(".xAxis").remove();
        svg.selectAll(".legendLine10")
            .attr("stroke-opacity", 0);
        svg.selectAll(".lineGraph")
            .attr("stroke-width",0.5);
        svg.append("g")
            .attr("class", "xAxis")
            .style("font-size", "14px")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xNew));
        svg.selectAll(".nodeImageP1")
            .transition().duration(400)
            .attr("fill-opacity",1)
            .attr("stroke-opacity",1);

        svg.selectAll(".nodeImageP1")
            .transition().duration(400)
            .attr("fill-opacity",function(d){
                return (d.name.indexOf("Manasa")<0 && d.name.indexOf("Paul")<0)? 1 : 0;})
            .attr("stroke-opacity",function(d){
                return (d.name.indexOf("Manasa")<0 && d.name.indexOf("Paul")<0)? 1 : 0;});
        svg.selectAll(".links01")
            .transition().duration(400)
            .attr("stroke-opacity",function(d){
                return (d.source.name.indexOf("Manasa")<0 && d.source.name.indexOf("Paul")<0)? 1 : 0;
            });

        // Project 2
        svg.selectAll(".links02")
            .transition().duration(400)
            .attr("stroke-opacity",function(d){
                return (d.source.name.indexOf("Manasa")<0 && d.source.name.indexOf("Paul")<0)? 1 : 0;
            });

        // Project 3
        svg.selectAll(".links03")
            .transition().duration(400)
            .attr("stroke-opacity",function(d){
                return (d.source.name.indexOf("Manasa")<0 && d.source.name.indexOf("Paul")<0)? 1 : 0;
            });

        // Column name

        if (!revealIdentity){
            svg.selectAll(".nodeP1")
                .transition().duration(400)
                .attr("fill-opacity",1);
            svg.selectAll(".nodeP2")
                .transition().duration(400)
                .attr("fill-opacity",1);
            svg.selectAll(".nodeP3")
                .transition().duration(400)
                .attr("fill-opacity",1);
        }

        // Column names
        svg.append("text")
            .attr("class", "columnLabel")
            .attr("x", firstGroupX)
            .attr("y", groupY)
            .attr("text-anchor", "middle")
            .text("Contribution")
        svg.append("text")
            .attr("class", "columnLabel")
            .attr("x", secondGroupX)
            .attr("y", groupY)
            .attr("text-anchor", "middle")
            .text("In-class Presentation");
        svg.append("text")
            .attr("class", "columnLabel")
            .attr("x", thirdGroupX)
            .attr("y", groupY)
            .attr("text-anchor", "middle")
            .text("Project 1");

        svg.append("text")
            .attr("class", "columnLabel")
            .attr("x", fourthGroupX)
            .attr("y", groupY)
            .attr("text-anchor", "middle")
            .text("Final");

        svg.selectAll(".columnLabel")
            .transition().duration(400)
            .attr("fill-opacity",1);

        // Draw grade axis ***********
        // aGrade
        const offset = 0;
        var aGrades = [22, 18.7, 15.4, 12.1];
        var aText = ["A", "B", "C", "D", "F"];
        for (var i=0; i<aGrades.length-1;i++){
            svg.append("line")
                .attr("class", "lineGradeP1")
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .attr("x1", width*0.99)
                .attr("y1", yPA(aGrades[i])-offset)
                .attr("x2", width*0.99)
                .attr("y2", yPA(aGrades[i+1]+0.3)-offset);
            svg.append("line")
                .attr("class", "lineGradeP1")
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .attr("x1", width*0.98)
                .attr("y1", yPA(aGrades[i])-offset)
                .attr("x2", width*0.99)
                .attr("y2", yPA(aGrades[i])-offset);
            svg.append("line")
                .attr("class", "lineGradeP1")
                .attr("stroke", "#000")
                .attr("stroke-width", 1)
                .attr("x1", width*0.98)
                .attr("y1", yPA(aGrades[i+1]+0.3)-offset)
                .attr("x2", width*0.99)
                .attr("y2", yPA(aGrades[i+1]+0.3)-offset);
            svg.append("text")
                .attr("class", "textGradeP1")
                .style("font-size", "18px")
                .attr("text-anchor", "start")
                .attr("fill", "#000")
                .attr("x", width*0.99+4)
                .attr("y", (yPA(aGrades[i])+yPA(aGrades[i+1]))/2-offset)
                .text(aText[i]);
        }
    }
    else{
        fadeP1();
    }

    simulation.restart();
    simulation.alpha(0.3);
    simulationP1.restart();
    simulationP1.alpha(0.3);
    simulationP2.restart();
    simulationP2.alpha(0.3);
    simulationP3.restart();
    simulationP3.alpha(0.3);
    svg.selectAll(".lineGraph")
        .transition().duration(300)
        .attr("d", function(d) {
            return valueline(d);
        });


}

function fadeP1(){
    svg.selectAll(".xAxis").remove();
    svg.selectAll(".legendLine10")
        .attr("stroke-opacity", 1);
    svg.selectAll(".lineGraph")
        .attr("stroke-width",1);
    svg.append("g")
        .attr("class", "xAxis")
        .style("font-size", "14px")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    svg.selectAll(".nodeImageP1")
        .transition().duration(1500)
        .attr("fill-opacity",0)
        .attr("stroke-opacity",0);
    svg.selectAll(".nodeP1")
        .transition().duration(1500)
        .attr("fill-opacity",0);
    svg.selectAll(".linksP1")
        .transition().duration(1500)
        .attr("stroke-opacity",0);
    svg.selectAll(".lineGradeP1")
        .transition().duration(1500)
        .remove();
    svg.selectAll(".textGradeP1")
        .transition().duration(1500)
        .remove();
    // Project 2
    svg.selectAll(".nodeImageP2")
        .transition().duration(1500)
        .attr("fill-opacity",0)
        .attr("stroke-opacity",0);
    svg.selectAll(".nodeP2")
        .transition().duration(1500)
        .attr("fill-opacity",0);
    svg.selectAll(".linksP2")
        .transition().duration(1500)
        .attr("stroke-opacity",0);
    svg.selectAll(".lineGradeP2")
        .transition().duration(1500)
        .remove();

    // Project 3
    svg.selectAll(".nodeImageP3")
        .transition().duration(1500)
        .attr("fill-opacity",0)
        .attr("stroke-opacity",0);
    svg.selectAll(".nodeP3")
        .transition().duration(1500)
        .attr("fill-opacity",0);
    svg.selectAll(".linksP3")
        .transition().duration(1500)
        .attr("stroke-opacity",0);
    svg.selectAll(".lineGradeP3")
        .transition().duration(1500)
        .remove();

    svg.selectAll(".columnLabel")
        .transition().duration(400)
        .attr("fill-opacity",0)
        .remove()
}




function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
