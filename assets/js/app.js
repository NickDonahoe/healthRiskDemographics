var svgWidth = 850;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(dataset, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d[chosenXAxis]) * 0.8,
    d3.max(dataset, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// // function used for updating x-scale var upon click on axis label
function yScale(dataset, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d[chosenYAxis]) * 0.8,
    d3.max(dataset, d => d[chosenYAxis]) * 1.2
    ])
    .range([0, height]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCirclesX(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with a transition to
// new circles
function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "income") {
    var label = "income:";
  }
  else if (chosenXAxis === "poverty") {
    var label = "Poverty"
  }
  else {
    var label = "age";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    // .offset([80, -60])
    .html(function (d) {
      return (`${label}<br>${d[chosenXAxis]}, ${d.abbr}, ${d.healthcare}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseenter", function (data) {
    toolTip.show(data)
  })
    // onmouseout event
    .on("mouseexit", function (data) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenYAxis, circlesGroup) {

  if (chosenYAxis === "healthcare") {
    var label = "Healthcare:";
  }
  else if (chosenXAxis === "smokes") {
    var label = "Smokes"
  }
  else {
    var label = "Obesity";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    // .offset([80, -60])
    .html(function (d) {
      return (`${label}<br>${d[chosenYAxis]}, ${d.abbr}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
dataset = []
d3.csv("assets/data/data.csv")
  .then(function (rows) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    rows.forEach((row) => {
      row.abbr = row.abbr;
      row.age = parseFloat(row.age);
      row.healthcare = parseFloat(row.healthcare);
      row.income = parseInt(row.income);
      row.obesity = parseFloat(row.obesity);
      row.smokes = parseFloat(row.smokes);
      row.poverty = parseFloat(row.poverty);

      dataset.push(row);
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(rows, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(rows, d => d.healthcare), d3.max(rows, d => d.healthcare)])
      .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(rows)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .text(d => d.abbr)
      .attr("r", 15)
      .attr("fill", "red")
      .attr("opacity", ".5")



    // Create group for  2 x- axis labels
    var labelsGroupX = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var incomeLabel = labelsGroupX.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");


    var povertyLabel = labelsGroupX.append("text")
      .attr("x", 0)
      .attr("y", 35)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");

    var ageLabel = labelsGroupX.append("text")
      .attr("x", 0)
      .attr("y", 50)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    // append y axis
    var labelsGroupY = chartGroup.append("g")
      .attr("transform", `translate(${0}, ${height / 20}) rotate(-90)`);

    var healthcareLabel = labelsGroupY.append("text")
      .attr("y", -30)
      .attr("x", 0 - (height / 2))
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare (%)");


    var smokesLabel = labelsGroupY.append("text")
      .attr("y", -45)
      .attr("x", - (height / 2))
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    var obesityLabel = labelsGroupY.append("text")
      .attr("y", -60)
      .attr("x", - (height / 2))
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obese (%)");


    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroupX.selectAll("text")
      .on("click", function () {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          console.log(chosenXAxis)

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(rows, chosenXAxis);

          // updates x axis with transition
          xAxis = renderAxesX(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenXAxis === "income") {
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "poverty") {
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true)
          }
          else {
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

        labelsGroupY.selectAll("text")
        .on("click", function () {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = value;

            console.log(chosenYAxis)

            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(rows, chosenYAxis);

            // updates x axis with transition
            yAxis = renderAxesY(yLinearScale, yAxis);

            // updates circles with new x values
            circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
              healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
              smokesLabel
                .classed("active", false)
                .classed("inactive", true);
              obesityLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenYAxis === "smokes") {
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
              smokesLabel
                .classed("active", true)
                .classed("inactive", false);
              obesityLabel
                .classed("active", false)
                .classed("inactive", true)
            }
            else {
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
              smokesLabel
                .classed("active", false)
                .classed("inactive", true);
              obesityLabel
                .classed("active", true)
                .classed("inactive", false);
            }
          }
    });

  });