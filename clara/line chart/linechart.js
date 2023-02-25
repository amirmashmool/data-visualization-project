function drawChart_a4_v1() {
    let div_id = "#a4_v1";

    // Definition of the div target dimentions
    let ratio = 2.5; // 3 width = 1 height
    let win_width = d3.select(div_id).node().getBoundingClientRect().width;
    let win_height = win_width / ratio;

    // set the dimensions and margins of the graph
    let margin = {top: 30, right: 30, bottom: 30, left: 50};
    let width = win_width - margin.right - margin.left;
    let height = win_height - margin.top - margin.bottom;


	let svg = d3.select(div_id)
		.append("svg")
		.attr("viewBox", "0 0 " + win_width + " " + win_height)

    let g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");     


    d3.csv("../../data_clean/monthly_data.csv").then( function(data) {

        data.forEach(function(d) {
            d['min'] = +d['min'];
            d['max'] = +d['max'];
            d['mean'] = +d['mean'];
        });


        let normalize_year = function (year) {
            return 'y'+year;
        }

        // Add X axis
        var x = d3.scaleBand().range([0, width]).padding(1).domain(data.map(function(d) { return d.month; }));
            
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            
        g.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height-10)
            .text("Month");

        // Add Y axis        
        var y = d3.scaleLinear().range([height, 0])
            .domain([d3.min(data, function(d){return d.min}), d3.max(data, function(d) { return d.max; })])
            .range([height,0 ]);

        g.append("g")
            .call(d3.axisLeft(y))
        g.append("text")
            .attr("text-anchor", "end")
            .attr("x", 10)
            .attr("y", 10 )
            .text("Temperature")
            .attr("text-anchor", "start")



        var sumstat = d3.groups(data, d => d.year)
        var years = sumstat.map(function(d){return d[0]});

        var color_light = d3.scaleOrdinal().domain([years]).range(['#94fc8c', '#feff89', '#89e2ff', '#fe8ac9', '#c4c4c4', '#ffae66', '#f62927', '#b27ee6'])
        var color_dark = d3.scaleOrdinal().domain([years]).range(['#0d8b03', '#d6d600', '#006c8e', '#b10060', '#595959', '#f97600', '#8d0101', '#591c96'])

        var color = d3.scaleOrdinal()
                .domain([years])
                .range(['#16f306', '#feff1e', '#1ec9ff', '#f80187', '#8e8e8e', '#ff9b42', '#cd0a08', '#7c27d2']);



        var tooltip = d3.select(div_id)
            .append("div")
            .style("position", "absolute")
            .style("opacity", 0)
            .style("background-color", "rgb(211,211,211)")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .attr("class", "tooltip")
            .style("width", "auto")
            .style("height", "auto")
            .style("pointer-events", "none")

        // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
        var showTooltip = function(event, d) {
            tooltip
                .transition()
                .duration(500)
            tooltip
                .style("opacity", 1)
                .html(d.month+ " " + d.year+ ': <br> min:'+ d.min +  '<br> mean: ' + d.mean + '<br> max: ' + d.max)
                .style("left", event.pageX + "px")
                .style("top", (event.pageY - 28) + "px")
        }

        var hideTooltip = function(d) {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
        }
        

        var highlight = function(event, d){
            // reduce opacity of all groups
            d3.selectAll(".point").style("opacity", 0.1)
            // expect the one that is hovered
            d3.selectAll("."+ normalize_year(d)).style("opacity", 1)
        }

        // And when it is not hovered anymore
        var noHighlight = function(event, d){
            d3.selectAll(".point").style("opacity", 1)
        }
        

        //select path - three types: curveBasis,curveStep, curveCardinal
        g.selectAll(".line")
            .data(sumstat)
            .join("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return color_light(d[0]) })
            .attr("class", function(d) { return "point "+ normalize_year(d[0]) })
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                return d3.line()
                    .x(function(d) { return x(d.month); })
                    .y(function(d) { return y(d.min); })
                    (d[1])
            
            })
            
        g.selectAll(".line")
            .data(sumstat)
            .join("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return color_dark(d[0]) })
            .attr("class", function(d) { return "point "+ normalize_year(d[0]) })
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                return d3.line()
                    .x(function(d) { return x(d.month); })
                    .y(function(d) { return y(d.max); })
                    (d[1])
            
            })   
            



        g.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", function(d) { return "point "+ normalize_year(d.year) })
            .attr("cx", function(d) { return x(d.month); } )
            .attr("cy", function(d) { return y(d.mean);})
            .attr("r", 4)
            .attr("fill", function(d){ return color(d.year) })
            .on("mouseover", showTooltip )
            .on("mouseleave", hideTooltip )


        svg.selectAll("myrect")
            .data(years)
            .enter()
            .append("circle")
            .attr("cx", width - 135)
            .attr("cy", function(d,i){ return  20+ i*25})
            .attr("r", 7)
            .style("fill", function(d){ return color_light(d)})
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)

        svg.selectAll("myrect")
            .data(years)
            .enter()
            .append("circle")
            .attr("cx", width - 120)
            .attr("cy", function(d,i){ return 20 + i*25})
            .attr("r", 7)
            .style("fill", function(d){ return color(d)})
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)

        svg.selectAll("myrect")
            .data(years)
            .enter()
            .append("circle")
            .attr("cx", width - 105)
            .attr("cy", function(d,i){ return  20+ i*25})
            .attr("r", 7)
            .style("fill", function(d){ return color_dark(d)})
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)


        // Add labels beside legend dots
        svg.selectAll("mylabels")
            .data(years)
            .enter()
            .append("text")
            .attr("x", width-90)
            .attr("y", function(d,i){ return i * 25 + 20})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)

  

    });
}

drawChart_a4_v1();
