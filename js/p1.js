// Parse the date / time
var parseTime = d3.timeParse("%m/%d/%Y");

var submisionTime_mark = parseTime("3/7/2020");
var submisionProjectTime_mark = parseTime("3/29/2020");
// load data
d3.json('data/students.json').then(function (data) {
    studenDetail = {};
    data.forEach(d=>studenDetail[d.full_name] = d);
    d3.tsv('data/P1.tsv').then(data=>{
    data.forEach((d,i)=>{
        d.Date={key:d.Date,value:d.Date===""?Infinity:(temp = parseTime(d.Date),temp.setHours(12),temp)}
        d["SubmisionTime"] = d["SubmisionTime"]===""?new Date():parseTime(d["SubmisionTime"]);
        d["SubmissionProject"] = d["SubmissionProject"]===""?new Date():parseTime(d["SubmissionProject"]);
        d.Late = daysBetween(submisionTime_mark, d["SubmisionTime"])*2;
        d.LateProject = daysBetween(submisionProjectTime_mark, d["SubmissionProject"])*2;
        });

    let topicNet = d3.nest().key(d=>d.Topic).object(data.filter(d=>d.Topic!==''));
    data.sort((a,b)=>a.Date.value-b.Date.value).forEach((d,i)=>d.index = i+1);
    // let marker = data.find(d=>d.Date.value>new Date());
    // data.filter(d=>marker.Date.key===d.Date.key).forEach(d=>d.Date.next=true);

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
                        return `<p style="background-color: ${colorTopic(d)}">${d.Topic}${d.Topic?` `:'----not submit----'}</p>`;
                    else
                        return d.Topic;
                }
            },
            {   targets: 5,
                title: 'Project link',
                orderable: false,
                "searchable": false,
                "data": null,
                "render": function ( d, type, row, meta ) {
                    if (d.Projectlink!=='')
                        if(!d.Projectlink.includes('https://'))
                            d.Projectlink = 'project1/'+d.Projectlink;
                    if (type=='display')
                        return d.Projectlink==''?'':`<a target="blank" href="${d.Projectlink}"><i class="fa fa-cloud-download"></i></a>`;
                    else
                        return d.Projectlink;
                }
            },
            {   targets: 4,
                title: 'Image',
                orderable: false,
                "searchable": false,
                "data": null,
                "render": function ( d, type, row, meta ) {
                    if (type=='display')
                        return d.Image?`<image src="project1/${d.Image}" style="width:80px;height:80px;"></image>`:'';
                    else
                        return d.Projectlink;
                }
            },
            {   targets: 6,
                title: 'Late submit topic',
                orderable: true,
                "searchable": false,
                "data": null,
                "render": function ( d, type, row, meta ) {
                    if (type == 'display'){
                        return d.Late?`-${d.Late}%`:'';
                    }else
                            return d.Late;
                    }
            },
            {   targets: 6,
                title: 'Late submit project',
                orderable: true,
                "searchable": false,
                "data": null,
                "render": function ( d, type, row, meta ) {
                    if (type == 'display'){
                        return d.LateProject?`-${d.LateProject}%`:'';
                    }else
                        return d.LateProject;
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
})})

