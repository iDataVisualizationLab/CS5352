d3.json('data/students.json').then(function (data) {
    let container = d3.select('#main');
    console.log(data);
});