function drawChart_a4_v3() {
    const div_id = "#a4_v3";

    d3.select(div_id)
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("align-items", "center")
        .style("width", "100%");

    // set the dimensions and margins of the graph
    const margin = {top: 60, right: 30, bottom: 20, left: 110},
        width = 660 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // This is what I need to compute kernel density estimation
    function kernelDensityEstimator(kernel, X) {
        return function(V) {
            return X.map(function(x) {
                return [x, d3.mean(V, function(v) { return kernel(x - v); })];
            });
        };
    }
    function kernelEpanechnikov(k) {
        return function(v) {
            return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
    }

    // Variables
    const years = [2021, 2017, 2013, 2009, 2005, 2001, 1997, 1993];
    const default_year = 2021

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]
    const x_range = [-15, 40];

    const measure_color = [
        ["min", "#04D5FAFF"],
        ["max", "#FA040CFF"]
    ]

    // Year Selector
    let selector_div = d3.select(div_id)
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
    const svg = d3.select(div_id)
        .append("div")
        .style("width", "70vh")
        .style("height", "70vh")
        .append("svg")
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            `translate(${margin.left}, ${margin.top})`);

    d3.csv("../data_clean/Salorno_dates.csv").then(function (data) {
        let yearly_data = {}
        for (let i in years) {
            const year = years[i];
            yearly_data[year] = data.filter((d) => Number(d.date.split("-")[0]) === year)
        }

        // Add X axis
        const x = d3.scaleLinear()
            .domain(x_range)
            .range([0, width]);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        // Create a Y scale for densities
        const y = d3.scaleLinear()
            .domain([0, 0.7])
            .range([height, 0]);

        // Create the Y axis for names
        const yName = d3.scaleBand()
            .domain(months)
            .range([0, height])
            .paddingInner(1)
        svg.append("g")
            .call(d3.axisLeft(yName));

        // Compute kernel density estimation for each column:
        const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40)) // increase this 40 for more accurate density.
        const densities = [];
        for(let m in months){
            const month = months[m];
            const month_nr = Number(m) + 1;

            let monthDensities = new Array(x.ticks(40).length)
            for(let i in x.ticks(40)){
                monthDensities[i] = {"min": {}, "max": {}};
            }
            for(let meas in measure_color) {
                const measure = measure_color[meas][0];

                for(let y in years) {
                    const year = years[y];
                    const year_data = yearly_data[year].filter((d) => Number(d.date.split("-")[1]) === month_nr);

                    const measure_year_densities = kde(year_data.map((d) => d[measure]));

                    for(let i in x.ticks(40)){
                        monthDensities[i][measure][year] = measure_year_densities[i];
                    }
                }
            }
            densities.push({"month": month, "densities": monthDensities});
        }

        // Draw Path
        let paths = {}
        for(let k in measure_color){
            const measure = measure_color[k][0];
            const color = measure_color[k][1];

            paths[measure] = svg.selectAll("areas")
                .data(densities)
                .join("path")
                .attr("transform", (d) => "translate(0, " + (yName(d.month)-height) + ")")
                .datum((d) => d.densities)
                .attr("stroke", color)
                .attr("fill", "none")
                .attr("stroke-width", 1)
        }

        // Function to update path based on year
        function drawRidges(year){
            console.log(year)
            for(let k in measure_color){
                const measure = measure_color[k][0];

                // Add areas
                paths[measure].transition()
                    .duration(500)
                    .attr("d",  d3.line()
                        .curve(d3.curveBasis)
                        .x((d) => x(d[measure][year][0]))
                        .y((d) => y(d[measure][year][1]))
                    )
            }
        }
        // Default year
        drawRidges(default_year);

        // Add on change trigger
        d3.select("#year_choice").on("change", function(d){ drawRidges(d3.select(this).property("value")); })
    })
}
drawChart_a4_v3()