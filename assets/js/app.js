const svgWidth = 980;
const svgHeight = 900;

const margin = {
  top: 0,
  right: 40,
  bottom: 100,
  left: 30
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;
const padding = 25;

const formatComma = d3.format(",");

console.log(width);
console.log(height);

// Create an SVG wrapper, append an SVG group that will hold the scatter chart, 
//and shift the latter by left and top margins.
const svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params when page is first opened
let chosenXAxis = "poverty";

// function used for updating x-scale const upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    const xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.9,
        d3.max(censusData, d => d[chosenXAxis]) * 1
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

function renderCircleText(circleText, newXScale, chosenXAxis) {

  circleText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    let label = "Poverty (%):";
    if (chosenXAxis === "poverty") {
      label = "Poverty (%):";
    }
    if (chosenXAxis === "age") {
        label = "Average Age:";
    }
  
    const toolTip = d3.tip()
      .attr("class", "d3-tip")
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>Smokes (%): ${d.smokes}`);
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

//START OF MAIN CODE
// Retrieve data from the data file and execute everything shown below
d3.csv("data.csv")
  .then(function(censusData) {

    //print the census data in the console
    console.log(censusData)
  
    // Parse Data/Cast as numbers
    // ==============================
      censusData.forEach(function(data) {
        
      data.age = +data.age;
      data.poverty = +data.poverty;
      data.smokes = +data.smokes;
      data.smokesLow = +data.smokesLow;
      data.smokesHigh = +data.smokesHigh;
    });

  // run the xScale function to size the xaxis
  var xLinearScale = xScale(censusData, chosenXAxis);
  
  // Scale the yaxis
  const yLinearScale = d3.scaleLinear()
   .domain([8, d3.max(censusData, d => d.smokes) * 1.1])
   .range([(height), 0]);

 // Create initial axis functions
  const bottomAxis = d3.axisBottom(xLinearScale);
  const leftAxis = d3.axisLeft(yLinearScale);

 // append x axis
  var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(25, ${height})`)
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
                .attr("x", -300)
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
    .attr("fill", "lightblue")
    .attr("stroke-width", "1")
    .attr("stroke", "black")
    .attr("opacity", ".5");
    

  // add text inside of the circles  
  var circleText = chartGroup.selectAll("text.stateText")
              .data(censusData)
              .enter()
              .append("text")
              .classed("stateText", true)
              .text(function(d){return d.abbr;
                    })
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

  const ageLabel = labelsGroup.append("text")
   .attr("x", 0)
   .attr("y", 40)
   .attr("value", "age") // value to grab for event listener
   .classed("inactive", true)
   .text("Average Age");    

 // updateToolTip function above csv import
  circlesTips = updateToolTip(chosenXAxis, circlesGroup);     

 // LISTENER FOR USER CLICK ON NEW X-AXIS
 labelsGroup.selectAll("text")
 .on("click", function() {
   
    console.log(chosenXAxis);
   // get value of selection
   const value = d3.select(this).attr("value");

   if (value !== chosenXAxis) {

     // replaces chosenXaxis with value
     chosenXAxis = value;

     console.log(chosenXAxis)

     // update the x-scale with new data
     xLinearScale = xScale(censusData, chosenXAxis);

     // update the x axis with transition
     xAxis = renderAxes(xLinearScale, xAxis);

     // updates circles with new x values
     circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);


     console.log(circleText);
    // updates circle text with new x values
     renderCircleText(circleText, xLinearScale, chosenXAxis);
    
     // updates tooltips with new info
     circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
    
     // changes classes to change bold text
     if (chosenXAxis === "poverty") {
       povertyLabel
         .classed("active", true)
         .classed("inactive", false);
       ageLabel
         .classed("active", false)
         .classed("inactive", true);
     }
     else {
       povertyLabel
         .classed("active", false)
         .classed("inactive", true);
       ageLabel
         .classed("active", true)
         .classed("inactive", false);
     }
   }
 });
});
