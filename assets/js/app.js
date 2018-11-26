const svgWidth = 960;
const svgHeight = 500;

const margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;
const padding = 25;

const formatComma = d3.format(",");

console.log(svgWidth);
console.log(svgHeight);

// Create an SVG wrapper, append an SVG group that will hold the scatter chart, and shift the latter by left and top margins.
const svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "poverty";

// function used for updating x-scale const upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    const xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }

// function used for updating xAxis const upon click on axis label
function renderAxes(newXScale, xAxis) {
    const bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    let label = "Poverty (%):";
    if (chosenXAxis === "poverty") {
      label = "Poverty (%):";
    }
    if (chosenXAxis === "income") {
        label = "Avg Income:";
    }
  
    const toolTip = d3.tip()
      .attr("class", "d3-tip")
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  } 


// Retrieve data from the data file and execute everything shown below
d3.csv("data.csv")
  .then(function(censusData) {

    //print the census data in the console
    console.log(censusData)
  
    // Parse Data/Cast as numbers
    // ==============================
      censusData.forEach(function(data) {
        
      data.income = +data.income;
      data.poverty = +data.poverty;
      data.smokes = +data.smokes;
      data.smokesLow = +data.smokesLow;
      data.smokesHigh = +data.smokesHigh;
      console.log(data.income, data.poverty)
    });

  // run the xScale function above the csv import
  let xLinearScale = xScale(censusData, chosenXAxis);
  
  // Create y scale function
  const yLinearScale = d3.scaleLinear()
   .domain([0, d3.max(censusData, d => d.smokes)])
   .range([height, 0]);

 // Create initial axis functions
  const bottomAxis = d3.axisBottom(xLinearScale);
  const leftAxis = d3.axisLeft(yLinearScale);

 // append x axis
  var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

 // append y axis
   chartGroup.append("g")
             .attr("class", "axis")
             .attr("transform", "translate(" + padding + ",0)")
             .call(leftAxis);

    chartGroup.append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("dy", "1em")
                .classed("active", true)
                .attr("y", -30)
                .attr("x", -200)
                .style("text-anchor", "middle")
                .text("Smokers (%)");

 // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.smokes))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("stroke-width", "1")
    .attr("stroke", "black")
    .attr("opacity", ".5");
    

  // add text inside of the circles
  
  var circleText = chartGroup.selectAll("text")
                .data(censusData)
                .enter()
                .append("text")
                .text(function(d){return d.abbr})
                .attr("x", d => xLinearScale(d[chosenXAxis]))
                .attr("y", d => yLinearScale(d.smokes)) 
                .attr("text-anchor" , "middle")
                .attr("font-size", "12px")
                .attr("fill", "black");       
             
                
 // Create group for  2 x- axis labels
  const labelsGroup = chartGroup.append("g")
   .attr("transform", `translate(${width / 2}, ${height + 20})`);

  const povertyLabel = labelsGroup.append("text")
   .attr("x", 0)
   .attr("y", 20)
   .attr("value", "poverty") // value to grab for event listener
   .classed("active", true)
   .text("% in Poverty");

  const incomeLabel = labelsGroup.append("text")
   .attr("x", 0)
   .attr("y", 40)
   .attr("value", "income") // value to grab for event listener
   .classed("inactive", true)
   .text("Average Annual Income");    

 // updateToolTip function above csv import
  circlesGroup = updateToolTip(chosenXAxis, circlesGroup);     

 // Create event listeners to display and hide the tooltip
    
 labelsGroup.selectAll("text")
 .on("click", function() {
   // get value of selection
   const value = d3.select(this).attr("value");
   if (value !== chosenXAxis) {

     // replaces chosenXaxis with value
     chosenXAxis = value;

     console.log(chosenXAxis)

     // functions here found above csv import
     // updates x scale for new data
     xLinearScale = xScale(censusData, chosenXAxis);

     // updates x axis with transition
     xAxis = renderAxes(xLinearScale, xAxis);

     // updates circles with new x values
     circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

     // updates tooltips with new info
     circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

     // changes classes to change bold text
     if (chosenXAxis === "poverty") {
       povertyLabel
         .classed("active", true)
         .classed("inactive", false);
       incomeLabel
         .classed("active", false)
         .classed("inactive", true);
     }
     else {
       povertyLabel
         .classed("active", false)
         .classed("inactive", true);
       incomeLabel
         .classed("active", true)
         .classed("inactive", false);
     }
   }
 });
});
