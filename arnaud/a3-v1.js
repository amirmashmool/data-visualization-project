function drawChart_a3_v1() {
    const div_id = "#a3_v1";

    //Width and height
    let win_width = d3.select(div_id).node().getBoundingClientRect().width;
    let win_height = win_width/2.2;

    let normalize_name = function (name) {
        return name.replaceAll(' ', '').replaceAll('.', '');
    }

    let zones;

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

    let margin = {top: 0, right: win_width/4, bottom: 0, left: win_width/4};
    let width = win_width - margin.right - margin.left;
    let height = win_height - margin.top - margin.bottom;
    
    
    
    let svg = d3.select(div_id)
        .append("svg")
        .attr("viewBox", "0 0 " + win_width + " " + win_height)
    
    let g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");     

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
        const projection = d3.geoIdentity()
            .reflectY(true)
            .fitSize([width, width*ratio], data);

        // Draw the map
        zones = g.append("g")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .selectAll("path")
            .data(data.features)
            .join("path")
            .attr("id", function (d){ return normalize_name("zone_" + d.properties.nome); } )
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .attr("fill", "white")
            .style("stroke", "black")

    })

    d3.csv("../data_clean/trees_located.csv").then( function(data) {
        const subgroup_data = d3.groups(data, d => d["Circoscrizione Name"]);
        const max_count = d3.max(subgroup_data.map(d => d[1].length));

        let subgroup_data_dict = {}
        for (let i in subgroup_data) {
            subgroup_data_dict[subgroup_data[i][0]] = subgroup_data[i][1];
        }


        const colors = d3.scaleThreshold()
            .domain([100, 300, 500, 1000, 2000, 3000, max_count])
            .range(d3.schemeGreens[7])


        // Three function that change the tooltip when user hover / move / leave a cell
        let mouseover = function (d) {
            Tooltip.style("opacity", 1);
        }
        let mousemove = function (event, d) {
            const circ = d.properties.nome;
            const tree_count = subgroup_data_dict[circ].length;
            Tooltip.html(circ + "<br>" + tree_count + " trees")
                .style("left", (event.pageX+20) + "px")
                .style("top", (event.pageY) + "px");
        }
        let mouseleave = function (d) {
            Tooltip.style("opacity", 0);
        }

        zones.attr("fill", function (d){ return colors(subgroup_data_dict[d.properties.nome].length); })
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave) 
           
        var legend = svg.selectAll('g.legendEntry')
            .data(colors.range())
            .enter()
            .append('g').attr('class', 'legendEntry');
        
        legend
            .append('rect')
            .attr("x", 120)
            .attr("y", function(d, i) {
               return 30+ i * 30;
            })
           .attr("width", 20)
           .attr("height", 20)
           .style("stroke", "black")
           .style("stroke-width", 1)
           .style("fill", function(d){return d;}); 
               //the data objects are the fill colors
        
        legend
            .append('text')
            .attr("x", 150) //leave 5 pixel space after the <rect>
            .attr("y", function(d, i) {
               return 30+ i * 30;
            })
            .attr("dy", "0.8em") //place text one line *below* the x,y point
            .text(function(d,i) {
                var extent = colors.invertExtent(d);
                //extent will be a two-element array, format it however you want:
                var format = d3.format("0.2f");
                if( i == 0 ) return "< " + format(+extent[1]);
                if(i == 6) return ">" + format(+extent[0]);
                return format(+extent[0]) + " - " + format(+extent[1]);
            });
        legend.append('text')
            .attr("x", 120)
            .attr("y", 20)
            .text("Tree Abundance")


    })

    
}

drawChart_a3_v1();