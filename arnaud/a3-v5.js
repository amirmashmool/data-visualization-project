function drawChart_a3_v5() {
    const div_id = "#a3_v5";

    let normalize_name = function (name) {
        return name.replaceAll(' ', '').replaceAll('.', '');
    }

    d3.select(div_id)
        .style("display", "flex")
        .style("justify-content", "center")
        .style("height", "70vh")
        .style("width", "100%");
    let main_win_size = d3.select(div_id).node().getBoundingClientRect().height;

    let svg = d3.select(div_id)
        .append("svg")
        .attr("viewBox", "0 0 " + main_win_size + " " + main_win_size);

    let toolbar = d3.select(div_id)
        .append("div")
        .style("width", "25vh")
        .append("svg")
        .attr("viewBox", "0 0 " + main_win_size*0.5 + " " + main_win_size);

    let zones;
    let projection;

    // Load external data and boot
    d3.json("../data/circoscrizioni.json").then( function(data) {

        function getGroupedVal (func, ax) {
            return func(data.features, function (d){
                return func(d.geometry.coordinates, function (d1) {
                    return d1[0][ax];
                })
            })
        }

        const max_x = getGroupedVal(d3.max, 0);
        const max_y = getGroupedVal(d3.max, 1);
        const min_x = getGroupedVal(d3.min, 0);
        const min_y = getGroupedVal(d3.min, 1);

        const ratio = (max_x-min_x) / (max_y-min_y);

        // Map and projection
        projection = d3.geoIdentity()
            .reflectY(true)
            .fitSize([main_win_size, main_win_size], data);

        // Draw the map
        zones = svg.append("g")
            .selectAll("path")
            .data(data.features)
            .join("path")
            .attr("id", function (d){ return normalize_name("zone_" + d.properties.nome); } )
            .attr("d", d3.geoPath().projection(projection))
            .attr("fill", "white")
            .style("stroke", "black")

    })

    let top_trees = Array(10);
    let color;
    d3.csv("../data_clean/a1_v1_tree_abundance.csv").then( function(data) {
        for(let i=0; i<9; i++){
            top_trees[i] = data[i].Name;
        }
        top_trees[9] = "Others";

        color = d3.scaleOrdinal()
            .domain(top_trees)
            .range(d3["schemeCategory10"]);

        toolbar.selectAll("colors")
            .data(top_trees)
            .enter()
            .append("circle")
            .attr("fill", (d) => color(d))
            .attr("cx", 80)
            .attr("cy", function(d,i){ return i * 25 + 15})
            .attr("r", 10);

        function mouseover(event, d) {
            d3.selectAll(".dots")
                .style("opacity", 0)
            d3.selectAll(".dots#dot_" + normalize_name(top_trees.includes(d)? d: "Others"))
                .style("opacity", 1)
        }
        function mouseleave(event, d) {
            d3.selectAll(".dots")
                .style("opacity", 1)
        }

        toolbar.selectAll("labels")
            .data(top_trees)
            .enter()
            .append("text")
            .text((d) => d)
            .attr("x", 100)
            .attr("y", function(d,i){ return i * 25 + 20})
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)

    })

    d3.json("../data/geo_data_trees.geojson").then( function(data) {
        const filtered_data = data.features.filter((d) => !!d.geometry)

        svg.append("g")
            .selectAll("circles")
            .data(filtered_data)
            .enter()
            .append("circle")
            .attr("class", "dots")
            .attr("id", (d) => "dot_" + normalize_name(top_trees.includes(d.properties.Name)? d.properties.Name: "Others"))
            .attr("cx", (d) => projection(d.geometry.coordinates)[0])
            .attr("cy", (d) => projection(d.geometry.coordinates)[1])
            .attr("r", 2)
            .attr("fill", (d) => color(top_trees.includes(d.properties.Name)? d.properties.Name: "Others"))
    })
}
drawChart_a3_v5();