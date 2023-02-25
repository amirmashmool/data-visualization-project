function drawChart_a1_v1() {
    let div_id = "#a1_v1";

    // Definition of the div target dimentions
    let ratio = 2.5; // 3 width = 1 height
    let win_width = d3.select(div_id).node().getBoundingClientRect().width;
    let win_height = win_width / ratio;

    // set the dimensions and margins of the graph
    let margin = {top: 30, right: 30, bottom: 140, left: 70};
    let width = win_width - margin.right - margin.left;
    let height = win_height - margin.top - margin.bottom;



	let svg = d3.select(div_id)
		.append("svg")
		.attr("viewBox", "0 0 " + win_width + " " + win_height);

    let xScale = d3.scaleBand().range([0, width]).padding(0.4),
        yScale = d3.scaleLinear().range([height, 0]);

    let g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
    d3.csv("../../data_clean/a1_v1_tree_abundance.csv", function(data) {
 
		data.forEach(function(d) {
			d.Count = +d.Count;
		  });

		let other = data.slice(50, data.length);
		let sum = d3.sum(other, function(d){ return d.Count});
		  
		data = data.slice(0, 50);

		xScale.domain(data.map(function(d) { return d.Name; }));
        yScale.domain([0, d3.max(data, function(d) { return d.Count; })]);

        g.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(xScale))
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", "-.6em")
			.attr("transform", "rotate(-65)" );

		g.append("g")
			.append("text")
			.style("text-anchor", "end")
			.attr("x", width)
			.attr("y", height+50)
			.attr('text-anchor', 'end')
			.attr('stroke', 'black')
			.text("Name")

        g.append("g")
			.call(d3.axisLeft(yScale).tickFormat(function(d){return d;}))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 10)
			.attr('dy', '-5em')
			.attr('text-anchor', 'end')
			.attr('stroke', 'black')
			.text('Count')

        g.selectAll(".bar")
			.data(data)
			.enter().append("rect")
			.attr("class", "bar")
			.on("mouseover", onMouseOver) // Add listener for event
			.on("mouseout", onMouseOut)
			.attr("x", function(d) { return xScale(d.Name); })
			.attr("y", function(d) { return yScale(d.Count); })
			.attr("width", xScale.bandwidth())
			.transition()
			.ease(d3.easeLinear)
			.duration(500)
			.delay(function(d,i){ return i * 50})
			.attr("height", function(d) { return height - yScale(d.Count); });

	d3.select('#other')
		.html(`
			 <h2>Others</h2>
			 <div> Count: ${sum}</div>
		 `);
	})
       
	// Mouseover event handler

	function onMouseOver(d, i) {
		// Get bar's xy values, ,then augment for the tooltip
		let xPos = d3.event.pageX + 10;
		let yPos = d3.event.pageY - 10;

		// Update Tooltip's position and value
		d3.select('#tooltip')
			.style('left', xPos + 'px')
			.style('top', yPos + 'px')
			.html(`
				<h2>${d.Name}</h2>
				<div> Count: ${d.Count}</div>
			`);
		
		d3.select('#tooltip').classed('hidden', false);

		d3.select(this).attr('class','highlight')
		d3.select(this)
			.transition() // I want to add animnation here
			.duration(500)
			.attr('width', xScale.bandwidth() + 5)
			.attr('y', function(d){return yScale(d.Count) - 10;})
			.attr('height', function(d){return height - yScale(d.Count) + 10;})

	}

	// Mouseout event handler
	function onMouseOut(d, i){
		d3.select(this).attr('class','bar')
		d3.select(this)
			.transition()
			.duration(500)
			.attr('width', xScale.bandwidth())
			.attr('y', function(d){return yScale(d.Count);})
			.attr('height', function(d) {return height - yScale(d.Count)})
		
		d3.select('#tooltip').classed('hidden', true);
	}
}

drawChart_a1_v1()