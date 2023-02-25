//sankeydiagram
// set the dimensions and margins
var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 750 - margin.left - margin.right,
    height = 750 - margin.top - margin.bottom;

// append the svg  to the body of the page
var svg = d3.select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// colors that are used
var color = d3.scaleOrdinal(d3.schemeCategory10);

// define the sankeydiagram properties
var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(15)
    .size([width, height]);

// load the data from json
url = "Deniz/sankeydiagram/sankey.json";
d3.json(url, function(error, graph) {
    console.log(graph);



    // creat a new Sankey generator with the default properties
    sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(1);

    // add the links
    var link = svg.append("g")
        .selectAll(".link")
        .data(graph.links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", sankey.link())
        .style("stroke-width", function (d) { return Math.max(1, d.dy); })

        .on("mouseover", onMouseOverLinks)
        .on("mousemove", onMouseMoveLinks)
        .on("mouseout", onMouseOutLinks);

    // add the nodes
    var node = svg.append("g")
        .selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3.drag()
            .subject(function (d) { return d; })
            .on("start", function () { this.parentNode.appendChild(this); })
            .on("drag", dragmove));

    // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function (d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) { return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function (d) { return d3.rgb(d.color).darker(2); })

    // add in the title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function (d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function (d) { return d.name; })
        .filter(function (d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start")

    // mouseover and tooltip
    function dragmove(d) {
        d3.select(this)
            .attr("transform",
                "translate("
                + d.x + ","
                + (d.y = Math.max(
                        0, Math.min(height - d.dy, d3.event.y))
                ) + ")");
        sankey.relayout();
        link.attr("d", sankey.link());
    }

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("padding", "15px")
        .style("background", "rgba(0,0,0,0.6)")
        .style("border-radius", "5px")
        .style("color", "#fff")
        .text("a simple tooltip");

    function onMouseOverLinks(event, d) {
        var link = graph.links[d]
        tooltip.html(`${link.value}`)
            .style("visibility", "visible");
    }

    function onMouseMoveLinks() {
        tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
    }

    function onMouseOutLinks(event, d) {
        tooltip.html(``).style("visibility", "hidden");
    }

});