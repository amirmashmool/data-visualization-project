function ridgeline() {
    const my_dataviz = "#a4_v3";
    d3.select("div")
        .attr("id", my_dataviz);

    d3.select(my_dataviz)
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center")
    .style("width", "100%");


    var margin = { top: 80, right: 30, bottom: 50, left: 110 },
        width = 650 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    const years = [2021, 2017, 2013, 2009, 2005, 2001, 1997, 1993];
    const months = Array.from({ length: 12 }, (item, i) => {
        return new Date(0, i).toLocaleString('en-US', { month: 'long' })
    });

    const x_range = [-15, 40];

        // Year Selector
        let selector_div = d3.select(my_dataviz)
        .append("div");

    selector_div.append("text").text("Year: ");
    selector_div.append("select")
        .attr("id", "year_choice")
        .selectAll("year_options")
        .data(years)
        .enter()
        .append("option")
        .text((d) => d)
        .attr("value", (d) => d);

            // append the svg object to the body of the page
    var svg = d3.select(my_dataviz)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");



    const x = d3.scaleLinear()
        .domain(x_range)
        .range([0, width]);


    const y = d3.scaleLinear()
        .domain([0, 0.7])
        .range([height, 0]);

    function kernelDensityEstimator(kernel, X) {
        return function (V) {
            return X.map(function (x) {
                return [x, d3.mean(V, function (v) { return kernel(x - v); })];
            });
        };
    }
    function kernelEpanechnikov(k) {
        return function (v) {
            return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
    }

    const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40)) // increase this 40 for more accurate density.

    d3.csv("../../data_clean/Salorno_dates.csv").then(function (data) {


        // Add X axis
        const x = d3.scaleLinear()
            .domain(x_range)
            .range([0, width]);
        svg.append("g")
            .attr("class", "xAxis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .select(".domain").remove()

        // Create a Y scale for densities
        const y = d3.scaleLinear()
            .domain([0, 0.60])
            .range([height, 0]);
        let chart_data = []

        for (let i = 0; i < months.length; i++) {

            let densities = []

            let monthDensities = new Array(x.ticks(40).length)
            for (let i in x.ticks(40)) {
                monthDensities[i] = { "min": {}, "max": {} };
            }
            for (let year of years) {
                yearly_data = data.filter((d) => Number(d.date.split("-")[0]) === year)
                const year_data = yearly_data.filter((d) => Number(d.date.split("-")[1]) === i + 1);
                const min_data = kde(year_data.map((d) => d["min"]));
                const max_data = kde(year_data.map((d) => d["max"]));

                for (let i in x.ticks(40)) {
                    monthDensities[i]["min"][year] = min_data[i];
                    monthDensities[i]["max"][year] = max_data[i];
                }
            }
            chart_data.push({ "month": months[i], "densities": monthDensities })
        }



        // Create a color scale using these means.
        const myColor = d3.scaleSequential()
            .domain([0, 100])
            .interpolator(d3.interpolateViridis);


        // Create the Y axis for names
        const yName = d3.scaleBand()
            .domain(months)
            .range([0, height])
            .paddingInner(1)
        svg.append("g")
            .call(d3.axisLeft(yName).tickSize(0))


        // Add areas
        console.log(chart_data)
        let color_list = [71, 15]
        let draw = {}
        for (let [index, value] of ["min", "max"].entries()) {
            draw[value] = svg.selectAll("areas")
                .data(chart_data)
                .join("path")
                .attr("transform", (d) => "translate(0, " + (yName(d.month) - height) + ")")
                .datum((d) => d.densities)
                .attr("fill", myColor(color_list[index]))
                .attr("opacity", 0.7)
                .attr("stroke", "#000")
                .attr("stroke-width", 0.1)
        }

        function drawRidges(year) {
            for (let [index, value] of ["min", "max"].entries()) {

                // Add areas

                // console.log()
                draw[value].transition()
                    .duration(500)
                    .attr("d", d3.line()
                        .curve(d3.curveBasis)
                        // .x((d) => x(console.log(d[value][year][0])))
                        .x((d) => x(d[value][year][0]))
                        .y((d) => y(d[value][year][1]))
                    )
            }
        }

        drawRidges(years[0]);

        d3.select("#year_choice").on("change", function (d) { drawRidges(d3.select(this).property("value")); })
    })

}

ridgeline()