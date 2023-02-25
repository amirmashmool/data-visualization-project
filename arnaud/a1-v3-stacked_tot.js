
function drawChart_a1_v3() {
    let div_id = "#a1_v3";

    // Definition of the div target dimentions
    let ratio = 3; // 3 width = 1 height
    let win_width = d3.select(div_id).node().getBoundingClientRect().width;
    let win_height = win_width / ratio;

    // set the dimensions and margins of the graph
    let margin = {top: 60, right: 30, bottom: 20, left: 30};
    let graph_width = win_width - margin.right - margin.left;
    let graph_height = win_height - margin.top - margin.bottom;

    // Value to be left out to the left for the y-axis labels. Good value found by trial and error
    let axis_label_width = 200;

    // Definition of the full svg
    let svg = d3.select(div_id)
        .append("svg")
        .attr("viewBox", "0 0 " + win_width + " " + win_height);

    let normalize_name = function (name) {
        return name.replaceAll(' ', '').replaceAll('.', '');
    }

    // Parse the Data
    d3.csv("../data_clean/a1_v3_stacked_chart_tot.csv", function (data) {

        // Subgroups (trees, other and total), groups (circoscrizione)
        let subgroups = data.columns.slice(1)
        let groups = d3.map(data, function (d) {
            return (d['Circoscrizione Name'])
        }).keys()

        // Ratio between tree and grouped columns width
        let tree_group_ratio = 12; // 1 unit of width for a tree graph will be 10 in the Other and Total graphs

        // Getting the largest total value to determine the width of the x-axis
        let range_max = d3.max(data, function (d) {
            return +d['Total'];
        });
        let range_small = range_max / tree_group_ratio;

        // 15: 1 unit for each tree then 5 for total and other columns
        let sub_graph_width = (graph_width - axis_label_width - ((subgroups.length - 1) * margin.right)) / ((tree_group_ratio * 2) + 5);

        // color palette = one color per subgroup
        let color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3["schemeCategory10"]);

        let shift_from_left = margin.left + axis_label_width;

        // create a tooltip
        let Tooltip = d3.select(div_id)
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("padding", "5px");

        // Create Y axis - Defined in the same way for all sub graphs
        let y = d3.scaleBand()
            .domain(groups)
            .range([0, graph_height])
            .padding([0.2]);

        // create highlight box
        svg.selectAll("mybar")
            .data(data)
            .enter()
            .append("rect")
            .attr("id", function (d) {
                return "high_" + normalize_name(d['Circoscrizione Name']);
            })
            .attr("x", 0)
            .attr("y", function (d) {
                return y(d['Circoscrizione Name']);
            })
            .attr("width", graph_width)
            .attr("height", y.bandwidth())
            .style("fill", "grey")
            .style("opacity", 0)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // For each subgroup
        for (let i = 0; i < subgroups.length; i++) {
            let subgroup = subgroups[i];

            let mult = (i < subgroups.length - 2) ? 1 : tree_group_ratio;
            let sub_width = sub_graph_width * mult;

            // Append 1 svg per tree and for other and for total
            let sub_svg = svg.append("g")
                .attr("transform", "translate(" + shift_from_left + "," + margin.top + ")");

            // Adding column titles
            sub_svg.append("text")
                .attr("x", 5)
                .attr("y", -5)
                .attr("text-anchor", "start")
                .style("font-size", "12px")
                .style("fill", color(subgroup))
                .attr("transform", "rotate(-20)")
                .text(subgroup);

            // Add X axis
            let x = d3.scaleLinear()
                .domain([0, (i < subgroups.length - 2) ? range_small : range_max])
                .range([0, sub_width]);

            let left_axis = d3.axisLeft(y).tickSize(0)
            sub_svg.call((i === 0) ? left_axis : left_axis.tickValues([]));

            // Three function that change the tooltip when user hover / move / leave a cell
            let mouseover = function (d) {
                // Tooltip.style("opacity", 1); // Remove tooltip
                d3.selectAll("#" + normalize_name(d['Circoscrizione Name']))
                    .style("opacity", 1);
                d3.select("#high_" + normalize_name(d['Circoscrizione Name']))
                    .style("opacity", 0.6);
                d3.selectAll("#info_" + normalize_name(d['Circoscrizione Name']))
                    .style("opacity", 1);
            }
            let mousemove = function (d) {
                /*
                let tree_counts = "";
                for (let i = 0; i < subgroups.length; i++) {
                    tree_counts = tree_counts + "<br> - " + subgroups[i] + ": " + d[subgroups[i]];
                }
                Tooltip.html("Trees counts in " + d['Circoscrizione Name'] + tree_counts)
                    .style("left", (d3.event.pageX+20) + "px")
                    .style("top", (d3.event.pageY) + "px");
                 */
            }
            let mouseleave = function (d) {
                //Tooltip.style("opacity", 0);
                d3.selectAll("#" + normalize_name(d['Circoscrizione Name']))
                    .style("opacity", 0.8);
                d3.select("#high_" + normalize_name(d['Circoscrizione Name']))
                    .style("opacity", 0);
                d3.selectAll("#info_" + normalize_name(d['Circoscrizione Name']))
                    .style("opacity", 0);
            }

            // Add subgroup data
            sub_svg.selectAll("mybar")
                .data(data)
                .enter()
                .append("rect")
                .attr("id", function (d) {
                    return normalize_name(d['Circoscrizione Name']);
                })
                .attr("x", 0)
                .attr("y", function (d) {
                    return y(d['Circoscrizione Name']);
                })
                .attr("height", y.bandwidth())
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
                .attr("fill", color(subgroup))
                .style("opacity", 0.8)
                .transition()
                .ease(d3.easeLinear)
                .duration(500)
                .delay(function (d, i) {
                    return i * 50;
                })
                .attr("width", function (d) {
                    return x(d[subgroup]);
                });

            // Add number detail
            sub_svg.selectAll("mydetail")
                .data(data)
                .enter()
                .append("text")
                .attr("id", function (d) {
                    return "info_" + normalize_name(d['Circoscrizione Name']);
                })
                .attr("x", function (d) {
                    return x(d[subgroup]);
                })
                .attr("y", function (d) {
                    return y(d['Circoscrizione Name']) + (y.bandwidth() / 2) + 3;
                })
                .attr("text-anchor", "start")
                .style("font-size", "12px")
                .style("fill", "white")
                .style("pointer-events", "none")
                .style("opacity", 0)
                .text(function (d) {
                    return d[subgroup];
                })
                .attr("x", function (d) {
                    if (x(d[subgroup]) - 10 > this.getComputedTextLength()) {
                        return x(d[subgroup]) - this.getComputedTextLength() - 5;
                    } else {
                        return 5;
                    }
                });

            // Finalize the subgroup iteration by adding the width of the subgraph to the shift from the left var
            shift_from_left = shift_from_left + sub_width + margin.right;
        }
    });

}

drawChart_a1_v3()