// Boxplot
function drawChart_a2_v2() {
    d3.json("../Deniz/boxplot/scratch.json").then(function (sumstat) {

        // set the dimensions and margins of the graph
        var margin = { top: 10, right: 30, bottom: 60, left: 180 },
            width = 600 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#a2_v2")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        const xMax = 40

        // Show the Y scale
        const y = d3.scaleBand()
            .range([height, 0])
            .domain(sumstat.map(d => d.key))
            .padding(.1);

        svg.append("g")
            .attr("transform", "translate(-50," + (0) + ")")
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain").remove()

        // Show the X scale
        const x = d3.scaleLinear()
            .domain([0, xMax])
            .range([0, width]).nice();

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(5))

        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.top + 30)
            .text("Height (m)");


        // Show the main vertical line
        svg.selectAll("vertLines")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("x1", function (d) { return (x(d.value.min)) })
            .attr("x2", function (d) { return (x(d.value.max)) })
            .attr("y1", function (d) { return (y(d.key) + y.bandwidth() / 2) })
            .attr("y2", function (d) { return (y(d.key) + y.bandwidth() / 2) })
            .attr("stroke", "#ff5500")
            .style("width", 40)
        // rectangle for the main box
        svg.selectAll("boxes")
            .data(sumstat)
            .enter()
            .append("rect")
            .attr("x", function (d) { return (x(d.value.q1)) })
            .attr("width", function (d) { return (x(d.value.q3) - x(d.value.q1)) })
            .attr("y", function (d) { return y(d.key); })
            .attr("height", y.bandwidth())
            .attr("stroke", "#ff5500")
            .style("fill", "#ff9966")
            .style("opacity", 0.3)


        // Show the median
        svg.selectAll("medianLines")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("y1", function (d) { return (y(d.key)) })
            .attr("y2", function (d) { return (y(d.key) + y.bandwidth()) })
            .attr("x1", function (d) { return (x(d.value.median)) })
            .attr("x2", function (d) { return (x(d.value.median)) })
            .attr("stroke", "#b33c00")
            .style("width", 90)

        // add small details
        svg.selectAll("detailLines")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("y1", function (d) { return (y(d.key)) + 15 })
            .attr("y2", function (d) { return (y(d.key) + y.bandwidth()) - 15 })
            .attr("x1", function (d) { return (x(d.value.max)) })
            .attr("x2", function (d) { return (x(d.value.max)) })
            .attr("stroke", "#b33c00")
            .style("width", 90)

        svg.selectAll("detailLines")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("y1", function (d) { return (y(d.key)) + 15 })
            .attr("y2", function (d) { return (y(d.key) + y.bandwidth()) - 15 })
            .attr("x1", function (d) { return (x(d.value.min)) })
            .attr("x2", function (d) { return (x(d.value.min)) })
            .attr("stroke", "#b33c00")
            .style("width", 90)

        // add individual points (outliers) with jitter: we need non-aggregated data
        d3.csv("../Deniz/boxplot/boxplot.csv").then(function (data) {
            // keep only the outliers
            data = data.filter(d => {
                return parseFloat(d.height) > sumstat[sumstat.findIndex(t => t.key == d.name)].value.max ||
                    parseFloat(d.height) < sumstat[sumstat.findIndex(t => t.key == d.name)].value.min
            })
            const jitterWidth = 10
            svg.selectAll("indPoints")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (d) { return (x(d.height)) })
                .attr("cy", function (d) { return (y(d.name) + (y.bandwidth() / 2) - jitterWidth / 2 + Math.random() * jitterWidth) })
                .attr("r", 2)
                .style("fill", "white")
                .attr("stroke", "#4d4dff")
        });
    })
}

drawChart_a2_v2();