import React from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson'
import data from '../world_countries.json'

export default class D3graph extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        if (this.props.view === 'Bar Chart') this.bar_view()
        else if (this.props.view === 'Location') this.location_view()
        else if (this.props.view === 'Timeline') this.timeline_view()
        else if (this.props.view === 'Tabular') this.tabular_view()
        else if (this.props.view === 'Line Chart') this.line_view()
    }

    componentDidUpdate() {
        d3.select(this.refs.svg).selectAll("*").remove()
        if (this.props.view === 'Bar Chart') this.bar_view()
        else if (this.props.view === 'Location') this.location_view()
        else if (this.props.view === 'Timeline') this.timeline_view()
        else if (this.props.view === 'Tabular') this.tabular_view()
        else if (this.props.view === 'Line Chart') this.line_view()
    }

    recursive_ymax(arr) {
        if ("value" in arr[0])
        return d3.max(arr, (d)=> d.value)
        else
        return d3.max(arr, (d)=> this.recursive_ymax(d.values))
    }

    preProcessing() {
        let dimensions = this.props.selectedDim
        let measure = this.props.selectedMea[0]
        const serverData = this.props.data
        const t_data = this.group_func(
        {
            "dimensions": dimensions,
            "measures": [{"measure": measure, "aggregate": "sum"}],
            "data": serverData
        })
        return t_data
    }

    timeline_view(){
        if (this.props.selectedDim.length == 1 && this.props.selectedDim[0] == 'Time') {
            let dimensions = this.props.selectedDim
            let measure = this.props.selectedMea[0]
            const serverData = this.props.data
            const t_data = this.group_func(
            {
                "dimensions": dimensions,
                "measures": [{"measure": measure, "aggregate": measure === "Tweet Count" ? "count" : "sum"}],
                "data": serverData
            })

            let data = t_data["data"][0]

            var svg = d3.select("svg"),
                margin = {top: 20, right: 20, bottom: 30, left: 50},
                width = +svg.attr("width") - margin.left - margin.right,
                height = +svg.attr("height") - margin.top - margin.bottom,
                g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var parseTime = d3.timeParse("%a %b %d %H:%M:%S %Z %Y");
            
            var x = d3.scaleTime()
                .rangeRound([0, width]);

            var y = d3.scaleLinear()
                .rangeRound([height, 0]);

            var line = d3.line()
                .x(function(d) { return x(parseTime(d.key)); })
                .y(function(d) { return y(d.value); });

            x.domain(d3.extent(data, function(d) { return parseTime(d.key); }));
            y.domain(d3.extent(data, function(d) { return d.value; }));
        
            g.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
        
            g.append("g")
                .call(d3.axisLeft(y))
            .append("text")
                .attr("fill", "#000")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
        
            g.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1.5)
                .attr("d", line);
        }
        else {
            var svg = d3.select(this.refs.svg).selectAll("*").remove()
        }
    }

    tabular_view(){
        if (this.props.selectedDim.length == 1 && this.props.selectedMea.length == 1) {
            let dimensions = this.props.selectedDim
            let measures = this.props.selectedMea
            const serverData = this.props.data
            const t_data = this.group_func(
            {
                "dimensions": dimensions,
                "measures": [{"measure": measures, "aggregate" : "sum"}],
                "data": serverData
            })

            let data = t_data["data"][0]
            console.log(data)
            let columns = dimensions.concat(measures)
            let dim_count = t_data["dim_count"]
            let meas_count = t_data["meas_count"]

            let svg = d3.select(this.refs.svg),
            margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom,
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var table = g.append("table"),
                thead = table.append("thead"),
                tbody = table.append("tbody");

            // append the header row
            thead.append("tr")
                .selectAll("th")
                .data(columns)
                .enter()
                .append("th")
                    .text(function(column) { console.log(column); return column; })
                .style("padding", "2px 4px")
                .style("font-weight", "bold");

            // create a row for each object in the data
            var rows = tbody.selectAll("tr")
                .data(data)
                .enter()
                .append("tr");

            // create a cell in each row for each column
            var cells = rows.selectAll("td")
                .data(function(row) {
                    console.log(row);
                    return columns.map(function(column) {
                        if (column === columns[0]) return { column: column, value: row.key };
                        else if (column == columns[1]) return { column: column, value: row.value};
                    });
                })
                .enter()
                .append("td")
                    .text(function(d) { console.log(d); return d.value; })
                .style("padding", "2px 4px");
        }
        else {
            var svg = d3.select(this.refs.svg).selectAll("*").remove()
        }
    }

    line_view(){
        if (this.props.selectedDim.length && this.props.selectedMea.length) {
            let dimensions = this.props.selectedDim
            let measure = this.props.selectedMea[0]
            const serverData = this.props.data
            const t_data = this.group_func(
            {
                "dimensions": dimensions,
                "measures": [{"measure": measure, "aggregate": measure === "Tweet Count" ? "count" : "sum"}],
                "data": serverData
            })

            let data = t_data["data"]
            let dim_count = t_data["dim_count"]
            let meas_count = t_data["meas_count"]

            let keys = []
            let it = data[0]
            let k;
            for (let i = 0; i < dim_count; ++i) {
                k = []
                it.forEach(el=>{
                    k = [...k, el.key]
                })
                keys = [...keys, k]
                it = it[0].values
            }

            let svg = d3.select(this.refs.svg),
                margin = {top: 20, right: 20, bottom: 30, left: 40},
                width = +svg.attr("width") - margin.left - margin.right,
                height = +svg.attr("height") - margin.top - margin.bottom,
                g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            /////////////////////////////////// X-AXIS ///////////////////////////////////
            let x_axes = []

            for (let i = 0; i < dim_count; ++i) {
                i === 0 ? x_axes = [...x_axes, d3.scaleBand().rangeRound([0, width]).domain(keys[i])]
                        : x_axes = [...x_axes, d3.scaleBand().domain(keys[i]).rangeRound([0, x_axes[i-1].bandwidth()])]
            }

            let mp, dx;
            x_axes.forEach((x_axis, i)=>{
                mp = (i == 0 ? 1 : keys[i - 1].length  * mp)
                dx = 0
                for (let j = 0; j < mp; j++){
                    g.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(" + dx + "," + (i == dim_count-1 ? height: i*20) + ")")
                        .call(d3.axisBottom(x_axis))
                        .selectAll("text")
                            .style("text-anchor", "end")
                            .attr("dx", "-.8em")
                            .attr("dy", ".15em")
                            .attr("transform", "rotate(-65)");
                    dx = dx + (i == 0 ? 0 : x_axes[i - 1].bandwidth())
                }
            })

            /////////////////////////////////// Y-AXIS ///////////////////////////////////
            var y = d3.scaleLinear()
                .rangeRound([height, 0]);

            var z = d3.scaleOrdinal()
                .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

            y.domain([0, 1.15*this.recursive_ymax(data[0])]).nice();


            g.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y).ticks(null, "s"))
                .append("text")
                .attr("x", 2)
                .attr("y", y(y.ticks().pop()) + 0.5)
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .text(" ");

            var line;
            let gp = g.append("g")
            for (let i = 0; i < dim_count; i++) {
                if (i == dim_count - 1) {
                    line = d3.line()
                            .x(function(d) { return x_axes[i](d.key); })
                            .y(function(d) { return y(d.value); });
                    gp = gp
                        .append("path")
                        .datum(function(d) { return dim_count == 1 ? data[0] : d.values })
                        .attr("fill", "none")
                        .attr("stroke", "steelblue")
                        .attr("stroke-linejoin", "round")
                        .attr("stroke-linecap", "round")
                        .attr("stroke-width", 1.5)
                        .attr("d", line)
                        .attr("transform", function() { return "translate(" + x_axes[i].bandwidth()/2 + ",0)"; });
                } else {
                    gp = gp
                        .selectAll("g")
                        .data(function(d) { return i == 0 ? data[0] : d.values })
                        .enter().append("g")
                        .attr("transform", function(d) { return "translate(" + x_axes[i](d.key) + ",0)"; })
                }
            }
        }
        else {
            var svg = d3.select(this.refs.svg).selectAll("*").remove()
        }
    }

    location_view(){
        if (this.props.selectedDim.length == 1 && this.props.selectedMea.length == 1 && this.props.selectedDim[0] == 'Place') {
            let dimensions = this.props.selectedDim
            let measure = this.props.selectedMea[0]
            const serverData = this.props.data
            const t_data = this.group_func(
            {
                "dimensions": dimensions,
                "measures": [{"measure": measure, "aggregate": measure === "Tweet Count" ? "count" : "sum"}],
                "data": serverData
            })

            var format = d3.format(",");
            var div = d3.select("body").append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

            let svg = d3.select(this.refs.svg),
                margin = {top: 20, right: 20, bottom: 30, left: 40},
                width = +svg.attr("width") - margin.left - margin.right,
                height = +svg.attr("height") - margin.top - margin.bottom,
                g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

            let x = this.recursive_ymax(t_data.data[0])
            let color = d3.scaleThreshold()
                    .domain([x / 10, x / 9, x / 8, x / 7, x / 6, x / 5, x / 4, x / 3, x / 2, x / 1])
                    .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)"])

            g.attr("width", width)
            .attr("height", height)
            .attr('class', 'map');

            let projection = d3.geoMercator()
                .scale(130)
                .translate( [width / 2, height / 1.5]);

            let path = d3.geoPath().projection(projection);

            let populationById = {};
            t_data.data[0].forEach(function(d) { populationById[d.key] = +d.value; });
            data.features.forEach(function(d) { d.population = populationById[d.id] });

            svg.append("g")
                .attr("class", "countries")
                .selectAll("path")
                .data(data.features)
                .enter().append("path")
                .attr("d", path)
                .style("fill", function(d) { return color(populationById[d.id]); })
                .style('stroke', 'white')
                .style('stroke-width', 1.5)
                .style("opacity",0.8)
                // tooltips
                .style("stroke","white")
                .style('stroke-width', 0.3)
                .on('mouseover',function(d){
                    div.transition()
                        .duration(200)
                        .style("opacity", .9)
                        .style("background-color", 'white');
                    div.html("Country : " + d.properties.name + "<br/>"  + measure + " : " + d.population)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY + 28) + "px");
                })
                .on('mouseout', function(d){
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            svg.append("path")
                .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
                    // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
                .attr("class", "names")
                .attr("d", path);
        }
        else {
            var svg = d3.select(this.refs.svg).selectAll("*").remove()
        }
    }

    bar_view() {
        if (this.props.selectedDim.length && this.props.selectedMea.length) {
            let dimensions = this.props.selectedDim
            let measure = this.props.selectedMea[0]
            const serverData = this.props.data
            const t_data = this.group_func(
            {
                "dimensions": dimensions,
                "measures": [{"measure": measure, "aggregate": measure === "Tweet Count" ? "count" : "sum"}],
                "data": serverData
            })

            let data = t_data["data"]
            let dim_count = t_data["dim_count"]
            let meas_count = t_data["meas_count"]

            let keys = []
            let it = data[0]
            let k;
            for (let i = 0; i < dim_count; ++i) {
                k = []
                it.forEach(el=>{
                    k = [...k, el.key]
                })
                keys = [...keys, k]
                it = it[0].values
            }

            let svg = d3.select(this.refs.svg),
                margin = {top: 20, right: 20, bottom: 30, left: 40},
                width = +svg.attr("width") - margin.left - margin.right,
                height = +svg.attr("height") - margin.top - margin.bottom,
                g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            /////////////////////////////////// X-AXIS ///////////////////////////////////
            let x_axes = []

            for (let i = 0; i < dim_count; ++i) {
                i === 0 ? x_axes = [...x_axes, d3.scaleBand().rangeRound([0, width]).domain(keys[i])]
                        : x_axes = [...x_axes, d3.scaleBand().domain(keys[i]).rangeRound([0, x_axes[i-1].bandwidth()])]
            }

            let mp, dx;
            x_axes.forEach((x_axis, i)=>{
                mp = (i == 0 ? 1 : keys[i - 1].length  * mp)
                dx = 0
                for (let j = 0; j < mp; j++){
                    g.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(" + dx + "," + (i == dim_count-1 ? height: i*20) + ")")
                        .call(d3.axisBottom(x_axis))
                        .selectAll("text")
                            .style("text-anchor", "end")
                            .attr("dx", "-.8em")
                            .attr("dy", ".15em")
                            .attr("transform", "rotate(-65)");
                    dx = dx + (i == 0 ? 0 : x_axes[i - 1].bandwidth())
                }
            })

            /////////////////////////////////// Y-AXIS ///////////////////////////////////
            var y = d3.scaleLinear()
                .rangeRound([height, 0]);

            var z = d3.scaleOrdinal()
                .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

            y.domain([0, 1.15*this.recursive_ymax(data[0])]).nice();


            g.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y).ticks(null, "s"))
                .append("text")
                .attr("x", 2)
                .attr("y", y(y.ticks().pop()) + 0.5)
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr("text-anchor", "start")
                .text(" ");

            let gp = g.append("g")
            for (let i = 0; i < dim_count; i++) {
                if (i == dim_count - 1) {
                    gp = gp
                        .selectAll("rect")
                        .data(function(d) { return dim_count == 1 ? data[0] : d.values })
                        .enter().append("rect")
                        .attr("x", function(d) { return x_axes[i](d.key); })
                        .attr("y", function(d) { return y(d.value); })
                        .attr("width", x_axes[i].bandwidth())
                        .attr("height", function(d) { return height - y(d.value); })
                        .attr("fill", function(d) { return z(d.key); });
                } else {
                    gp = gp
                        .selectAll("g")
                        .data(function(d) { return i == 0 ? data[0] : d.values })
                        .enter().append("g")
                        .attr("transform", function(d) { return "translate(" + x_axes[i](d.key) + ",0)"; })
                }
            }
        }
        else {
            var svg = d3.select(this.refs.svg).selectAll("*").remove()
        }
    }

    group_func = ({"dimensions": dim, "measures" : ms, "data": data})=> {
        let grouped_data = []
        ms.forEach(m=> {
            let view_data = d3.nest()
            dim.forEach(d=> {
                view_data = view_data.key((d1)=>{return d1[d]}).sortKeys(d3.ascending)
            })
            if (m.aggregate === "count"){
                view_data = view_data.rollup((d)=>{return d.length})
            } else if (m.aggregate === "sum") {
                view_data = view_data.rollup((d)=>{return d3.sum(d, (d1)=>{return d1[m.measure]})})
            } else if (m.aggregate === "average") {
                view_data = view_data.rollup((d)=>{return d3.mean(d, (d1)=>{return d1[m.measure]})})
            } else if (m.aggregate === "min") {
                view_data = view_data.rollup((d)=>{return d3.min(d, (d1)=>{return d1[m.measure]})})
            } else if (m.aggregate === "max") {
                view_data = view_data.rollup((d)=>{return d3.max(d, (d1)=>{return d1[m.measure]})})
            }
            view_data = view_data.entries(data)
            grouped_data = [...grouped_data, view_data]
        })
        return {"data": grouped_data, "dim_count": dim.length, "meas_count": ms.length}
    }

    render() {
        return <svg className="d3graph" width="1160" height="480" ref="svg"></svg>
    }

}