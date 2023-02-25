// https://d3-graph-gallery.com/graph/barplot_stacked_basicWide.html

function drawChart_a1_v4() {

    let div_id = "#a1_v4"

    // Definition of the div target dimentions
    let ratio = 2; // 3 width = 1 height
    let win_width = d3.select(div_id).node().getBoundingClientRect().width;
    let win_height = win_width / ratio;

    // set the dimensions and margins of the graph
    let margin = {top: 90, right: 30, bottom: 20, left: 30};
    let graph_width = win_width - margin.right - margin.left;
    let graph_height = win_height - margin.top - margin.bottom;

    // Value to be left out to the left for the y-axis labels. Good value found by trial and error
    let axis_label_width = 200;

    let normalize_name = function (name) {
        return name.replaceAll(' ', '').replaceAll('.', '').replaceAll('\'', '');
    }

    // append the svg object to the body of the page
    let svg = d3.select(div_id)
        .append("svg")
        .attr("viewBox", "0 0 " + win_width + " " + win_height)
        .append("g")
        .attr("transform", "translate(" + (margin.left + axis_label_width) + "," + margin.top + ")");

    // Parse the Data
    d3.csv("../data_clean/a1_v4_stacked_chart_perc.csv", function (data) {

        //data = data.slice(0, 5);

        // Subgroups (trees, other and total), groups (circoscrizione)
        let subgroups = data.columns.slice(1, 7)
        let groups = d3.map(data, function (d) {
            return (d['Circoscrizione Name'])
        }).keys()

        let max_width = d3.max(data, function (d) {
            let s = 0;
            for (let subgroup of subgroups) {
                s = s + Number(d[subgroup]);
            }
            return s;
        });

        // Add X axis
        let x = d3.scaleLinear()
            .domain([0, max_width])
            .range([0, graph_width - axis_label_width]);
        /*
        svg.append("g")
            .attr("transform", "translate(0," + graph_height + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0));
         */

        // Add Y axis
        let y = d3.scaleBand()
            .domain(groups)
            .range([0, graph_height])
            .padding([0.2]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // color palette = one color per subgroup
        let color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3["schemeCategory10"]);

        //stack the data? --> stack per subgroup
        let stackedData = d3.stack().keys(subgroups)(data);

        // Mouse over events
        let mouseover = function (d) {
            d3.selectAll("#" + normalize_name(d.key))
                .style("opacity", 1);
            d3.selectAll("#info_" + normalize_name(d.key))
                .style("opacity", 1);
        }
        let mouseleave = function (d) {
            d3.selectAll("#" + normalize_name(d.key))
                .style("opacity", 0.8);
            d3.selectAll("#info_" + normalize_name(d.key))
                .style("opacity", 0);
        }

        for (let i = 0; i < subgroups.length; i++) {
            svg.append("g")
                .append("text")
                .attr("text-anchor", "start")
                .style("font-size", "12px")
                .style("fill", color(subgroups[i]))
                .text(subgroups[i])
                .attr("transform", "translate(" + (x(stackedData[i][0][0]) + 10) + ",0)rotate(-45)");
        }

        // Show the bars
        svg.append("g")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            .enter().append("g")
            .attr("id", function (d) {
                return normalize_name(d.key);
            })
            .attr("fill", function (d) {
                return color(d.key);
            })
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
            .style("opacity", 0.8)
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(function (d) {
                return d;
            })
            .enter().append("rect")
            .attr("x", function (d) {
                return x(d[0]);
            })
            .attr("y", function (d) {
                return y(d.data['Circoscrizione Name']);
            })
            .attr("height", y.bandwidth())
            .attr("width", function (d) {
                return x(d[1]) - x(d[0]);
            });

        svg.append("g")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            .enter().append("g")
            .attr("id", function (d) {
                return "info_" + normalize_name(d.key);
            })
            .attr("text-anchor", "start")
            .style("opacity", 0)
            .style("font-size", "12px")
            .style("fill", "white")
            .style("pointer-events", "none")
            .selectAll("infos")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(function (d) {
                return d;
            })
            .enter().append("text")
            .text(function (d) {
                return Math.round(d[1] - d[0], 1) + "%";
            })
            .attr("y", function (d) {
                return y(d.data['Circoscrizione Name']) + (y.bandwidth() / 2) + 3;
            })
            .attr("height", y.bandwidth())
            .attr("width", function (d) {
                return x(d[1]) - x(d[0]);
            })
            .attr("x", function (d) {
                if (x(d[1]) - 10 > this.getComputedTextLength()) {
                    return x(d[1]) - this.getComputedTextLength() - 5;
                } else {
                    return 5;
                }
            });
    })

}

drawChart_a1_v4()