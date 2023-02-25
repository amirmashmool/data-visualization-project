const pages = [
    ["Home", "index.html"],
    ["First Assignment", "Assignment1Page.html"],
    ["Second Assignment", "Assignment2Page.html"],
    ["Third Assignment", "Assignment3Page.html"],
    ["Fourth Assignment", "Assignment4Page.html"]
]

d3.select("#navigation")
    .style("position", "fixed")
    .style("x", 0)
    .style("width", "100%")
    .style("display", "flex")
    .style("flex-wrap", "wrap")
    .style("flex-direction", "row")
    .style("justify-content", "center")
    .selectAll("buttons")
    .data(pages)
    .enter()
    .append("a")
    .attr("href", (d) => d[1])
    .append("input")
    .attr("type", "button")
    .attr("value", (d) => d[0])
    .attr("class", "button1")
    .style("padding-right", "12px")
    .style("padding-left", "12px")
    .style("border", "solid")
    .style("border-top", "none")
