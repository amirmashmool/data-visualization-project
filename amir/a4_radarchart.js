function drawChart_a4_v2() {

    const div_id = "#a4_v2"

    function Anglecalculation(angle, value) {
        let x = Math.cos(angle) * radialScale(value);
        let y = Math.sin(angle) * radialScale(value);
        return { "x": 300 + x, "y": 300 - y };
    }

    let years = ["1993", "1997", "2001", "2005", "2009", "2013", "2017", "2021"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    let colors = ["darkorange", "gray", "purple", "blue", "red", "green", "black", "yellow"];

    let x11 = document.getElementById("a4_v2");
    let label = document.createElement("label");
    label.setAttribute("for", "yearsradar");
    label.innerText = "Choose Year: ";
    x11.parentNode.insertBefore(label, x11);
    //Create array of options to be added
    let selectList = document.createElement("select");
    selectList.id = "yearsradar";
    selectList.name = "yearsradar";
    x11.parentNode.insertBefore(selectList, x11);
    //Create and append the options
    for (var i = 0; i < years.length; i++) {
        var option = document.createElement("option");
        option.value = years[i];
        option.text = years[i];
        selectList.appendChild(option);
    }

    let svg_div = d3.select(div_id)
        .append("div")
        .style("width", "70vh")
        .style("height", "70vh")

    let svgradar = svg_div
        .append("svg")
        .attr("viewBox", `0 0 600 600`)
        //.style("margin-bottom", -450 + "px")

    let radialScale = d3.scaleLinear()
        .domain([-10, 30])
        .range([0, 250]);
    let numragne = [-10, 0, 10, 20, 30];
    // let numragne = d3.range(-10, 30, 10)
    numragne.forEach(t =>
        svgradar.append("circle")
            .attr("cx", 300)
            .attr("cy", 300)
            .attr("fill", "#CDCDCD")
            .attr("stroke", "#CDCDCD")
            .attr("fill-opacity", 0.1)
            .attr("r", radialScale(t))
    );
    numragne.forEach(t =>
        svgradar.append("text")
            .attr("x", 305)
            .attr("y", 300 - radialScale(t))
            .text(t.toString())
    );

    for (var i = 0; i < months.length; i++) {
        let ft_name = months[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / months.length);
        let line_coordinate = Anglecalculation(angle, 30);
        let label_coordinate = Anglecalculation(angle, 32);

        //draw axis line
        svgradar.append("line")
            .attr("x1", 300)
            .attr("y1", 300)
            .attr("x2", line_coordinate.x)
            .attr("y2", line_coordinate.y)
            .attr("stroke", "black");

        //draw axis label
        svgradar.append("text")
            .attr("x", label_coordinate.x)
            .attr("y", label_coordinate.y)
            .text(ft_name);
    }
    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    function getPath(data_point) {
        let coordinates = [];
        for (var i = 0; i < months.length + 1; i++) {
            let ft_name = months[i % months.length];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / months.length);
            coordinates.push(Anglecalculation(angle, parseFloat(data_point[ft_name])));
        }
        return coordinates;
    }

    var highlight = function (d) {
        d3.select("#a4_v2").selectAll("path").style("opacity", .01)
        d3.select(`#Year${d}`).style("opacity", 1)
    }

    var noHighlight = function (d) {
        d3.select("#a4_v2").selectAll("path").style("opacity", 1)
    }

    function myFunc() {
        const selectedYear = document.getElementById("yearsradar").value;
        noHighlight(selectedYear);
        highlight(selectedYear);
    }
    document.getElementById("yearsradar").addEventListener("change", myFunc);

    d3.csv("../data_clean/radardata.csv").then(function (data) {
            for (i = 0; i < years.length; i++) {

                let temp_year = data.filter(function (row) {
                    return row.year == years[i];
                });
                let dict = {}
                temp_year.forEach(function (d) {
                    dict[d.month] = d.mean;
                });
                let color = colors[i];
                let coordinates = getPath(dict);
                //draw the path element
                svgradar.append("path")
                    .datum(coordinates)
                    .attr("d", line)
                    .attr("id", "Year" + years[i])
                    .attr("stroke-width", 3)
                    .attr("stroke", color)
                    .attr("fill", "none")
                    .attr("stroke-opacity", 1)
                    .attr("opacity", 1);
        }
    });

}

drawChart_a4_v2()