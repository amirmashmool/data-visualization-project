function drawChart_a3_v4() {
    const div_id = "#a3_v4";

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

    d3.json("../data/geo_data_trees.geojson").then( function(data) {
        const filtered_data = data.features.filter((d) => !!d.geometry )

        svg.append("g")
            .selectAll("circles")
            .data(filtered_data)
            .enter()
            .append("circle")
            .attr("cx", (d) => projection(d.geometry.coordinates)[0])
            .attr("cy", (d) => projection(d.geometry.coordinates)[1])
            .attr("r", 2)
            .attr("fill", "darkgreen")
    })
}
drawChart_a3_v4();