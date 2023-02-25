// https://d3-graph-gallery.com/graph/barplot_stacked_basicWide.html

function drawChart_a2_v4() {
    const div_id = "#a2_v4"

    // Definition of the div target dimentions
    const ratio = 3 / 1.5; // 3 width = 2 height
    const win_width = d3.select(div_id).node().getBoundingClientRect().width; //1920;//
    const win_height = win_width / ratio; //1200;//

    // set the dimensions and margins of the graph
    const margin = {top: 40, right: 10, bottom: 10, left: 40};
    const graph_width = win_width - margin.right - margin.left;
    const graph_height = win_height - margin.top - margin.bottom;

    // Function to get the max value of a column
    function get_col_max(data, col) {
        return d3.max(data, function(d) { return Number(d[col]); });
    }

    let normalize_name = function (name) {
        return name.replaceAll(' ', '').replaceAll('.', '');
    }

    // List of groups (here I have one group per column)
    const axis_measures = {
        x:[
            "Height (m)",
            "Crown Height (m)",
            "Crown Width (m)",
            "Canopy Cover (m2)",
            "Leaf Area (m2)",
            "Leaf Biomass (kg)"
        ],
        y: [
            "Carbon Storage (kg)",
            "Carbon Storage (eur)",
            "Gross Carbon Sequestration (kg/yr)",
            "Gross Carbon Sequestration (eur/yr)",
            "Avoided Runoff (mcube/yr)",
            "Avoided Runoff (eur/yr)",
            "Pollution Removal (g/yr)",
            "Pollution Removal (eur/yr)",
            "Energy Savings (eur/yr)",
            "Total Annual Benefits (eur/yr)",
            "Oxygen Production (kg/yr)"
        ]
    }

    // Style to add all the elements one on top of the other
    d3.select(div_id).style("flex-direction", "column");

    // Adding toolbar components such as measure choice and Reset button
    let toolbar = d3.select(div_id)
        .append("div")
        .style("display", "flex")
        .style("justify-content", "space-between")
        .style("flex-direction", "row");

    // Adding the measure choice dropdowns
    let measure_choice = toolbar
        .append("div")
        .style("flex-direction", "column");

    const axis = ["x", "y"];
    for (let i in axis) {
        const ax = axis[i];
        // add the options to the button
        let measure_axis_choice = measure_choice
            .append("div");

        measure_axis_choice.append("text")
            .text(ax.toUpperCase() + " axis: ");

        measure_axis_choice.append("select")
            .attr("id", ax + "_axis_options")
            .selectAll(ax + "_axis_options")
            .data(axis_measures[ax])
            .enter()
            .append("option")
            .text(function (d) {
                return d;
            })
            .attr("value", function (d) {
                return d;
            });
    }

    let reset_button = toolbar.append("div")
        .append("button")
        .text("Reset to default");

    // Parse the Data
    d3.csv("../data_clean/a2_v4_trees_size_carbon_6.csv").then( function(data) {

        // Axis variables
        const default_x_axis_name = 'Height (m)';
        const default_y_axis_name = 'Carbon Storage (kg)';

        let x_axis_name = default_x_axis_name;
        let y_axis_name = default_y_axis_name;

        // group the data: I want to draw one line per group
        const subgroup_data = d3.groups(data, d => d.Name)

        // All the unique keys (trees)
        const allKeys = subgroup_data.map( d => d[0] );

        // Define subgraph width and height
        const sub_win_width = graph_width / 3;
        const sub_win_height = graph_height / 2;
        const sub_width = sub_win_width - margin.left - margin.right;
        const sub_height = sub_win_height - margin.top - margin.bottom;

        /* ---------------------------------------------------------------------------
        Definition of the subgraph contents
        --------------------------------------------------------------------------- */

        // Add an svg element for each group. The will be one beside each other and will go on the next row when no more room available
        let svg = d3.select(div_id)
            .append("svg")
            .attr("viewBox", "0 0 " + win_width + " " + win_height)
            .selectAll("sub_charts")
            .data(subgroup_data)
            .enter()
            .append("g")
            .attr("transform", function(d,i) {
                const col = i%3;
                const row = parseInt((i/3).toString());
                return "translate(" + (margin.left + (col * (sub_win_width + margin.right))) + ","
                    + (margin.top + (row * (sub_win_height + margin.bottom))) + ")";
            });

        // Add X axis
        let x_domain = [ 0, get_col_max(data, x_axis_name) ];
        let x = d3.scaleLinear()
            .domain(x_domain)
            .range([ 0, sub_width ]);
        let x_axis = svg.append("g")
            .attr("transform", "translate(0," + sub_height + ")")
            .call(d3.axisBottom(x));

        //Add Y axis
        let y_domain = [ 0, get_col_max(data, y_axis_name) ];
        let y = d3.scaleLinear()
            .domain(y_domain)
            .range([ sub_height, 0 ]);
        let y_axis = svg.append("g")
            .call(d3.axisLeft(y));

        // color palette
        const color = d3.scaleOrdinal()
            .domain(allKeys)
            .range(d3["schemeCategory10"]);

        // clip box to not draw things outside of the graph content box
        svg.append("defs")
            .append("SVG:clipPath")
            .attr("id", "clip")
            .append("SVG:rect")
            .attr("width", sub_width )
            .attr("height", sub_height )
            .attr("x", 0)
            .attr("y", 0);

        // graph content group
        let subgraph_content = svg
            .append("g")
            .attr("clip-path", "url(#clip)");

        // Draw scatter data
        let circles = subgraph_content
            .selectAll("circles")
            .data( d => d[1] )
            .enter()
            .append("circle")
            .attr("r", 1.5)
            .attr("fill", function(d) { return color(d.Name); })
            .attr("cx", function(d) { return x(d[x_axis_name]); })
            .attr("cy", function(d) { return y(d[y_axis_name]); })
            .style("opacity", 0.8);

        // Add titles
        svg.append("text")
            .attr("text-anchor", "start")
            .attr("y", -10)
            .attr("x", 0)
            .text( d => d[0] )
            .style("fill", d => color(d[0]) );

        /* ---------------------------------------------------------------------------
        Measure switchers
        --------------------------------------------------------------------------- */

        // X_axis measure selector
        function changeXAxis(new_x_axis_name) {
            // Replace current axis name in var
            x_axis_name = new_x_axis_name;

            // Update axis
            x_domain = [ 0, get_col_max(data, new_x_axis_name) ];
            x.domain(x_domain);
        }
        d3.select("#x_axis_options")
            .on("change", function(d) {
                const selectedOption = d3.select(this).property("value");
                changeXAxis(selectedOption);
                updateChart();
        });

        // Y_axis measure selector
        function changeYAxis(new_y_axis_name) {
            // Replace current axis name in var
            y_axis_name = new_y_axis_name;

            // Update axis
            y_domain = [ 0, get_col_max(data, new_y_axis_name) ];
            y.domain(y_domain);
        }
        d3.select("#y_axis_options")
            .on("change", function(d) {
                const selectedOption = d3.select(this).property("value");
                changeYAxis(selectedOption);
                updateChart();
            });

        /* ---------------------------------------------------------------------------
        Zooming features
        --------------------------------------------------------------------------- */

        // Add brushing
        let brush = d3.brush()
            .extent( [ [0,0], [sub_width,sub_height] ] )
            .on("end", zoomChart);

        // Add the brushing
        subgraph_content.append("g")
            .attr("id", function(d) {
                return "brush_" + normalize_name(d[0]);
            })
            .call(brush);

        // A function that set idleTimeOut to null
        let idleTimeout;
        function idled() { idleTimeout = null; }

        // A function that updates the chart when the user zoom and thus new boundaries are available
        function zoomChart(event, chart_d) {
            const extent = event.selection

            // If no selection, back to initial coordinate. Otherwise, update X axis domain
            if(!extent){
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                x.domain(x_domain);
                y.domain(y_domain);
            }else{
                x.domain([ x.invert(extent[0][0]), x.invert(extent[1][0]) ]);
                y.domain([ y.invert(extent[1][1]), y.invert(extent[0][1]) ]);
                const brush_id = "#brush_" + normalize_name(chart_d[0]);
                subgraph_content.select(brush_id).call(brush.move, null);
            }

            updateChart();
        }

        /* ---------------------------------------------------------------------------
        Reset button functionality
        --------------------------------------------------------------------------- */

        function resetChart() {
            d3.select("#x_axis_options").node().value = default_x_axis_name;
            d3.select("#y_axis_options").node().value = default_y_axis_name;
            changeXAxis(default_x_axis_name);
            changeYAxis(default_y_axis_name);

            updateChart();
        }
        reset_button.on("click", resetChart);

        /* ---------------------------------------------------------------------------
        Update Chart function
        --------------------------------------------------------------------------- */

        function updateChart() {
            // Update axis and circle position
            x_axis.transition().duration(1000).call(d3.axisBottom(x));
            y_axis.transition().duration(1000).call(d3.axisLeft(y));
            circles.transition().duration(1000)
                .attr("cx", function (d) { return x(d[x_axis_name]); } )
                .attr("cy", function (d) { return y(d[y_axis_name]); } )

        }
    })
}

drawChart_a2_v4();