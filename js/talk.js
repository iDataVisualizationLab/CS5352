// Parse the date / time
var parseTime = d3.timeParse("%m/%d/%Y");

// load data
d3.tsv('data/T1.tsv').then(data=>{
    data.forEach(d=>d.Date={key:d.Date,value:d.Date===""?Infinity:parseTime(d.date)});
    let topicNet = d3.nest().key(d=>d.Topic).object(data.filter(d=>d.Topic!==''));
    data.sort((a,b)=>a.Date.value-b.Date.value);
    d3.select('#listHolder tbody')
        .selectAll('tr')
        .data(data)
        .enter().append('tr')
        .attr('bgcolor',(d,i)=>i%2?"#eef":"#efe")
        .html((d,i)=>`<td align="left" style="padding:5px;">${i+1}</td>
                <td align="left" style="padding:5px;">${d.Fullname}</td>
                <td align="left" style="padding:5px;">${d.Date.key}</td>
                <td align="left" style="padding:5px;background-color: ${topicNet[d.Topic]&&topicNet[d.Topic].length>1?'#ff7983':'unset'}">${d.Topic}${d.Topic?`<br><a href="${d.Paperlink}">Paper</a> of ${d.Author} `:''}</td>
                <td align="left" style="padding:5px;"><a target="blank" href="${d.Projectlink}"><i class="fa fa-cloud-download"></i></a> </td>`)
})