function drawChart_a3_v3() {
    const div_id = "a3_v3";

    d3.select("#" + div_id)
        .style("width", "100%")
        .style("display", "flex")
        .style("flex-direction", "row")
        .style("flex-wrap", "wrap")
        .style("justify-content", "center");

    // Basic definition of svg zone of main graph
    let svg_div = d3.select("#" + div_id)
        .append("div")
        .style("width", "70vh")
        .style("height", "70vh")
        .style("padding", "5px")

    // Size definitions
    const win_width = d3.select("#" + div_id).node().getBoundingClientRect().width;
    const win_height = svg_div.node().getBoundingClientRect().height;

    const main_win_size = win_height * 1.5 < win_width? win_height: win_width;
    const tool_win_width = main_win_size / 2.8;

    let svg = svg_div.append("svg")
        .attr("viewBox", "0 0 " + main_win_size + " " + main_win_size);

    // Right toolbar
    let toolBar = d3.select("#" + div_id)
        .append("div")
        .attr("id", "toolbar_" + div_id)
        .style("display", "flex")
        .style("flex-wrap", "wrap")
        .style("justify-content", "space-between");

    function decide_flex_dir() {
        const div_width = d3.select("#" + div_id).node().getBoundingClientRect().width;
        const dir = (div_width < window.innerHeight)? "row": "column";
        d3.select("#toolbar_" + div_id).style("flex-direction", dir);
    }
    d3.select(window).on("resize." + div_id, decide_flex_dir);
    decide_flex_dir();

    // Legend div
    let legend = toolBar.append("div")
        .style("width", "30vh");

    // Minimap div
    let minimap_div = toolBar.append("div")
        .style("width", "30vh")
        .style("display", "flex")
        .style("flex-direction", "column");

    // Minimap title
    let minimap_title_div = minimap_div.append("div")
        .style("width", "30vh")
        .style("margin-top", "10px")
        .style("margin-bottom", "10px")
        .style("padding-left", "20px");

    minimap_title_div.append("Text")
        .text("Neighbourhood: ")
        .style("font-weight", "bold");

    const default_minimap_title = "Click on the map";
    let minimap_title = minimap_title_div.append("Text")
        .text(default_minimap_title);

    // Minimap
    let minimap = minimap_div.append("div")
        .style("padding", "5px")
        .style("width", "30vh")
        .style("height", "30vh");

    // create a tooltip
    let Tooltip = d3.select("#" + div_id)
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

    function normalize_name(name) {
        return name.replaceAll(' ', '').replaceAll('.', '');
    }

    d3.json("../data_clean/a3.json").then( function(data) {
        const measure = "Oxygen Production (kg/yr)";

        /* ---------------------------------------------------------------------------------------------
        Color Range
        --------------------------------------------------------------------------------------------- */
        const max_dens = d3.max(data.features, (d) => Number(d.properties[measure]));
        const max_dens_quart = d3.max(data.features,
            (d) => d3.max(d.properties['Quartiere'].features,
                (d) => Number(d.properties[measure])));
        const max_measure = max_dens > max_dens_quart? max_dens: max_dens_quart;

        const colors = d3.scaleThreshold()
            .domain([
                1000,
                2500,
                5000,
                10000,
                25000,
                50000,
                max_measure
            ])
            .range(d3.schemeBlues[7])

        /* ---------------------------------------------------------------------------------------------
        Main svg
        --------------------------------------------------------------------------------------------- */
        const projection = d3.geoIdentity()
            .reflectY(true)
            .fitSize([main_win_size, main_win_size], data);

        let zones = svg.append("g")
            .selectAll(".zones_" + div_id)
            .data(data.features)
            .enter()
            .append("path")
            .attr("class", "zones_" + div_id)
            .attr("id", (d) => normalize_name(d.properties.Name) )
            .attr("d", d3.geoPath().projection(projection))
            .attr("fill", (d) => colors(d.properties[measure]))
            .style("stroke", "black");

        /* ---------------------------------------------------------------------------------------------
        Hover functions
        --------------------------------------------------------------------------------------------- */
        function mouseover(event, d) {
            const circ = d.properties.Name;
            zones.style("opacity", 0.8);
            d3.selectAll("#" + normalize_name(circ) + ".zones_" + div_id)
                .style("stroke-width", 3)
                .style("opacity", 1);
            Tooltip.style("opacity", 1);
        }
        zones.on("mouseover", mouseover);

        function mousemove(event, d) {
            const circ = d.properties.Name;
            const prod = Math.round(d.properties[measure] * 100) / 100;
            const tot_area = Math.round(d.properties["Area"] / 10000) / 100;
            Tooltip.html(
                circ + "<br>" +
                "Total area: " + tot_area + " km2<br>" +
                prod + " kg of Oxygen produced per Year"
            )
                .style("left", (event.pageX+20) + "px")
                .style("top", (event.pageY) + "px");
        }
        zones.on("mousemove", mousemove)

        function mouseleave(event, d) {
            const circ = d.properties.Name;
            zones.style("opacity", 1);
            d3.selectAll("#" + normalize_name(circ) + ".zones_" + div_id)
                .style("stroke-width", 1);
            Tooltip.style("opacity", 0);
        }
        zones.on("mouseleave", mouseleave)

        /* ---------------------------------------------------------------------------------------------
        Minimap zones
        --------------------------------------------------------------------------------------------- */
        const circos = data.features.map((d) => [d.properties.Name, d]);
        for (let i in circos){
            const circo_name = circos[i][0];
            const circo_data = circos[i][1].properties['Quartiere'];

            const mini_projection = d3.geoIdentity()
                .reflectY(true)
                .fitSize([tool_win_width, tool_win_width], circo_data);

            let minimap_svg = minimap.append("div")
                .style("opacity", 0)
                .style("pointer-events", "none")
                .style("position", "absolute")
                .attr("class", "minimap_" + div_id)
                .attr("id", normalize_name(circo_name))
                .append("svg")
                .attr("width", tool_win_width)
                .attr("height", tool_win_width);

            let minimap_zones = minimap_svg.append("g")
                .selectAll("quart")
                .data(circo_data.features)
                .enter()
                .append("path")
                .attr("class", "mini_zones_" + div_id)
                .attr("id", (d) => normalize_name(d.properties.Name) )
                .attr("d", d3.geoPath().projection(mini_projection))
                .style("fill", (d) => colors(d.properties[measure]))
                .style("stroke", "black");

            /* ---------------------------------------------------------------------------------------------
            Minimap Border
            --------------------------------------------------------------------------------------------- */
            const circo_features = data.features;
            const circo_border = circo_features.filter((d) => d.properties.Name === circo_name);
            const filtered_data = {
                "features": circo_border,
                "type": "FeatureCollection"
            };
            const border_projection = d3.geoIdentity()
                .reflectY(true)
                .fitSize([tool_win_width, tool_win_width], filtered_data);

            minimap_svg.append("g")
                .selectAll("border")
                .data(circo_border)
                .enter()
                .append("path")
                .attr("d", d3.geoPath().projection(border_projection))
                .style("pointer-events", "none")
                .style("fill", "none")
                .style("stroke", "black")
                .style("stroke-width",3);

            /* ---------------------------------------------------------------------------------------------
            Minimap Hover functions
            --------------------------------------------------------------------------------------------- */
            function mouseover_mini(event, d) {
                const quart = d.properties.Name;
                d3.selectAll(".mini_zones_" + div_id).style("opacity", 0.8);
                d3.selectAll("#" + normalize_name(quart) + ".mini_zones_" + div_id)
                    .style("stroke-width", 3)
                    .style("opacity", 1);
                Tooltip.style("opacity", 1);
            }
            minimap_zones.on("mouseover", mouseover_mini);

            function mousemove_mini(event, d) {
                const quart = d.properties.Name;
                const prod = Math.round(d.properties[measure] * 100) / 100;
                const tot_area = Math.round(d.properties["Area"] / 10000) / 100;
                Tooltip.html(
                    quart + "<br>" +
                    "Total area: " + tot_area + " km2<br>" +
                    prod + " kg of Oxygen produced per Year"
                )
                    .style("left", (event.pageX+20) + "px")
                    .style("top", (event.pageY) + "px");
            }
            minimap_zones.on("mousemove", mousemove_mini);

            function mouseleave_mini(event, d) {
                const quart = d.properties.Name;
                d3.selectAll(".mini_zones_" + div_id).style("opacity", 1);
                d3.selectAll("#" + normalize_name(quart) + ".mini_zones_" + div_id)
                    .style("stroke-width", 1)
                    .style("opacity", 0.8);
                Tooltip.style("opacity", 0);
            }
            minimap_zones.on("mouseleave", mouseleave_mini);
        }

        /* ---------------------------------------------------------------------------------------------
        Minimap toggle
        --------------------------------------------------------------------------------------------- */
        let active_minimap = null;
        function mouseclick(event, d) {
            const circo = normalize_name(d.properties.Name);
            if (active_minimap !== circo) {
                d3.select("#" + active_minimap + ".minimap_" + div_id)
                    .style("opacity", 0)
                    .style("pointer-events", "none");
                d3.select("#" + circo + ".minimap_" + div_id)
                    .style("opacity", 1)
                    .style("pointer-events", "auto");
                minimap_title.text(d.properties.Name);
                active_minimap = circo;
            }
        }
        zones.on("click", mouseclick);

        /* ---------------------------------------------------------------------------------------------
        Legend
        --------------------------------------------------------------------------------------------- */
        let legend_svg = legend.append("svg")
            .attr("viewBox", "0 0 " + (tool_win_width * 1.2)+ " " + tool_win_width)
            .selectAll('g.legendEntry')
            .data(colors.range())
            .enter()
            .append('g').attr('class', 'legendEntry');

        legend_svg.append('rect')
            .attr("x", 20)
            .attr("y", function(d, i) {
                return 30+ i * 30;
            })
            .attr("width", 20)
            .attr("height", 20)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("fill", function(d){return d;});
        //the data objects are the fill colors

        legend_svg.append('text')
            .attr("x", 50) //leave 5 pixel space after the <rect>
            .attr("y", function(d, i) {
                return 30+ i * 30;
            })
            .attr("dy", "0.8em") //place text one line *below* the x,y point
            .text(function(d,i) {
                var extent = colors.invertExtent(d);
                //extent will be a two-element array, format it however you want:
                var format = d3.format("0.1f");
                if(i===0) return "< " + format(+extent[1]);
                if(i===6) return ">" + format(+extent[0]);
                return format(+extent[0]) + " - " + format(+extent[1]);
            });

        legend_svg.append('text')
            .attr("x", 20)
            .attr("y", 20)
            .text("Oxygen Production (kg/year)");
    });
}

drawChart_a3_v3();