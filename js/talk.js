// Parse the date / time
var parseTime = d3.timeParse("%m/%d/%Y");
var submisionTime_mark = parseTime("3/13/2020");
// load data
d3.json('data/students.json').then(function (data) {
    studenDetail = {};
    data.forEach(d=>studenDetail[d.full_name] = d);
    d3.tsv('data/T1.tsv').then(data=>{
    data.forEach((d,i)=>{
        d.Date={key:d.Date,value:d.Date===""?Infinity:(temp = parseTime(d.Date),temp.setHours(12),temp)};
        d["SubmisionTimeProject"] = d["SubmisionTimeProject"]===""?new Date():parseTime(d["SubmisionTimeProject"]);
        d.Late = daysBetween(submisionTime_mark, d["SubmisionTimeProject"]);
    });
    data.push({
        Fullname:'&#x273F &#x273F &#x273F &#x273F',
        Date: {key:'3/14/2020',value:parseTime('3/14/2020')},
        SubmisionTime:'',
        Topic:'&#x273F&#x273F&#x273F&#x273F&#x273F&#x273F&#x273F&#x273F&#x273F Spring Break March 14-22 &#x273F&#x273F&#x273F&#x273F&#x273F&#x273F&#x273F&#x273F&#x273F',
        Author:'TTU',
        Paperlink:'https://www.depts.ttu.edu/officialpublications/calendar/19-20_cal_onepage.pdf',
        Projectlink: 'https://www.depts.ttu.edu/officialpublications/calendar/19-20_cal_onepage.pdf',
        Late: 0,
    });
    let topicNet = d3.nest().key(d=>d.Topic).object(data.filter(d=>d.Topic!==''));
    data.sort((a,b)=>a.Date.value-b.Date.value).forEach((d,i)=>d.index = i+1);
    let marker = data.find(d=>d.Date.value>new Date());
    data.filter(d=>marker.Date.key===d.Date.key).forEach(d=>d.Date.next=true);
    // d3.select('#listHolder tbody')
    //     .selectAll('tr')
    //     .data(data)
    //     .enter().append('tr')
    //     .attr('bgcolor',(d,i)=>i%2?"#eef":"#efe")
    //     .html((d,i)=>`<td align="left" style="padding:5px;">${i+1}</td>
    //             <td align="left" style="padding:5px;">${d.Fullname}</td>
    //             <td align="left" style="padding:5px;">${d.Date.key}</td>
    //             <td align="left" style="padding:5px;background-color: ${topicNet[d.Topic]&&topicNet[d.Topic].length>1?'#ff7983':'unset'}">${d.Topic}${d.Topic?`<br><a href="${d.Paperlink}">Paper</a> of ${d.Author} `:''}</td>
    //             <td align="left" style="padding:5px;">${d.SubmisionTime}</td>
    //             <td align="left" style="padding:5px;"><a target="blank" href="${d.Projectlink}"><i class="fa fa-cloud-download"></i></a> </td>`)
    $('#listHolder').DataTable({
        data: data,
        "order": [[2, "asc"]],
        "pageLength": 50,
        "columnDefs": [
            {   targets: 0,
                title: "No.",
                orderable: true,
                "searchable": false,
                "data": null,
                className:'text',
                "render": function ( d, type, row, meta ) {
                    if (type=='display')
                        return d.index;
                    else
                        return d.index;
                }
            },
            {   targets: 1,
                title: 'Student name',
                orderable: true,
                "data": null,
                "render": function ( d, type, row, meta ) {
                    if (type=='display') {
                        return (studenDetail[d.Fullname]?`<img alt="${d.Fullname}" class="clip-circle ${d.Date.next?'pluse-red':''}" src="${studenDetail[d.Fullname].photo}">`:'') +d.Fullname+(d.Date.next?'<span style="color: #d9290b">--Next presenter--</span>':'');
                    }
                    return d.Fullname;
                }
            },
            {   targets: 2,
                title: "Present date",
                orderable: true,
                "data": null,
                className:'angle',
                "render": function ( d, type, row, meta ) {
                    if (type=='display') {
                        return d.Date.key;
                    }
                    else
                        return +d.Date.value;
                }
            },
            {   targets: 3,
                title: 'Topic',
                orderable: true,
                "data": null,
                "render": function ( d, type, row, meta ) {
                    if (type=='display')
                        return `<p style="background-color: ${colorTopic(d)}">${d.Topic}${d.Topic?`<br><a href="${d.Paperlink}">Paper</a> of ${d.Author} `:'----not submit----'}</p>`;
                    else
                        return d.Topic;
                }
            },
            {   targets: 4,
                title: 'Submission date',
                orderable: true,
                "data": null,
                // className:'btngroup',
                "render": function ( d, type, row, meta ) {
                    if (type=='display')
                        return d.SubmisionTime;
                    else
                        return +parseTime(d.SubmisionTime)||Infinity;
                }
            },
            {   targets: 5,
                title: 'Slides',
                orderable: false,
                "searchable": false,
                "data": null,
                "render": function ( d, type, row, meta ) {
                    if (type=='display')
                        return d.Projectlink==''?'<p style="background-color: red">\'----not submit----\'</p>':`<a target="blank" href="https://github.com/iDataVisualizationLab/CS5352/blob/master/talks/${d.Projectlink}"><i class="fa fa-cloud-download"></i></a>`;
                    else
                        return d.Projectlink;
                }
            },
            {   targets: 6,
                title: 'Late',
                orderable: true,
                "searchable": false,
                "data": null,
                "render": function ( d, type, row, meta ) {
                    if (type=='display')
                        return d.Late>0?`-${d.Late}%`:'';
                    else
                        return d.Late;
                }
            }
        ]});

    function colorTopic (d){
        topic = d.Topic
        author = d.Author
        if (author!=='TTU') {
            if (topic == '' || topic === null)
                return '#eeee71';
            if (topicNet[topic] && topicNet[topic].length > 1)
                return '#ff7983';
            else
                return 'unset';
        }
        return '#13d9b7'
    }
})});

