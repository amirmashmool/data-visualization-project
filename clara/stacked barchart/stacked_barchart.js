function drawChart_a1_v2() {
    // set the dimensions and margins of the graph
    let div_id = "#a1_v2";

    // Definition of the div target dimentions
    let ratio = 2.5; // 3 width = 1 height
    let win_width = d3.select(div_id).node().getBoundingClientRect().width;
    let win_height = win_width / ratio;

    // set the dimensions and margins of the graph
    let margin = {top: 30, right: 30, bottom: 30, left: 200};
    let width = win_width - margin.right - margin.left;
    let height = win_height - margin.top - margin.bottom;



	let svg = d3.select(div_id)
		.append("svg")
		.attr("viewBox", "0 0 " + win_width + " " + win_height)

    let g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");     

    d3.csv("../../data_clean/a1_v2_stacked_chart.csv", function(data) {

        var subgroups = data.columns.slice(1)

        var groups = d3.map(data, function(d){return(d['Circoscrizione Name'])}).keys()

        // Add X axis
        var x = d3.scaleLinear()
            .domain([0, 3050])
            .range([0, width ])
        
        // Add Y axis        
        var y = d3.scaleBand()
            .domain(groups)
            .range([0, height])
            .padding([0.2])

        g.append("g")
            .attr("transform", "translate(" + 0 + "," + height + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .append("text")
            .attr('text-anchor', 'end')
            .attr("x", width)
            .attr("y", -5)
            .attr('stroke', 'black')
            .text("Count")


        g.append("g")
            .call(d3.axisLeft(y))
			.append("text")
			.attr('text-anchor', 'begin')
            .attr("x", -10)
			.attr('stroke', 'black')
            .text('Zone');


        // color palette = one color per subgroup

        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3["schemeCategory10"]);

        //stack the data? --> stack per subgroup
        var stackedData = d3.stack()
            .keys(subgroups)
            (data)

        var tooltip = d3.select("#a1_v2")
        .append("div")
        .style("position", "absolute")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("width", "auto")
        .style("height", "auto")
        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d) {
            let xPos = d3.event.pageX + 10;
            let yPos = d3.event.pageY;    
            var subgroupName = d3.select(this.parentNode).datum().key;
            var subgroupValue = d.data[subgroupName];
            tooltip
                .html(subgroupName + ": " + subgroupValue)
                .style("opacity", 1)
                .style('left', xPos + 'px')
                .style('top', yPos + 'px')
                .style('color', 'black')
        }
        
        
        var mouseleave = function(d) {
            tooltip
              .style("opacity", 0)
        }
                  
        

        // Show the bars
        g.append("g")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            .enter().append("g")
            .attr("fill", function(d) { return color(d.key); })
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("y", function(d) { return y(d.data['Circoscrizione Name']); })
            .attr("x", function(d) { return x(d[0]); })
            .attr("height", y.bandwidth())
            .attr("width",function(d) { return x(d[1]) - x(d[0]); })
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)

            
            

            

        var legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(subgroups.slice().reverse())
            .enter().append("g")
          //.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
           .attr("transform", function(d, i) { return "translate(0," + (350 + i * 20) + ")"; });
      
        legend.append("rect")
            .attr("x", width - 30)
            .attr("y", -20)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color);
      
        legend.append("text")
            .attr("x", width - 35)
            .attr("y", -7)
            .text(function(d) { return d; });
    		//d3.select(this).attr('class','highlight')

      
})


}

drawChart_a1_v2()