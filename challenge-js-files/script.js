// variables nécessaire à la création des données du premier tableau.
let data1 = [];
let tbody1 = document.querySelectorAll("#table1 tbody > tr");
let années = tbody1[0].getElementsByTagName("th");

// Boucles de traitements
for (let j = 1; j < années.length - 1; j++) {
  let année = [];
  for (let i = 1; i < tbody1.length; i++) {
    let pair = [];
    let pays = tbody1[i].getElementsByTagName("td")[0].textContent;
    if (pays.charAt(pays.length - 1) == ")") {
      pays = pays.slice(0, pays.length - 3);
    }
    pair.push(getCountryCode(pays));
    pair.push(parseFloat(tbody1[i].getElementsByTagName("td")[j].textContent));

    année.push(pair);
  }
  data1.push(année);
}

// variables de création d'éléments DOM
let table1 = document.querySelector("#table1");
let buttonsDiv = document.createElement("div");
buttonsDiv.setAttribute("id", "years");
table1.parentNode.insertBefore(buttonsDiv, table1);

let mapDiv = document.createElement("div");
mapDiv.setAttribute("id", "map");
mapDiv.setAttribute("width", table1.offsetWidth);
table1.parentNode.insertBefore(mapDiv, table1);

//traitements d'insertions
for (let i = 0; i < data1.length; i++) {
  let button = document.createElement("button");
  let year = document.createTextNode((2002 + i) + "");
  button.appendChild(year);
  buttonsDiv.appendChild(button);
  button.addEventListener("click", function() {
    Highcharts.mapChart('map', {
      chart: {
        map: 'custom/europe'
      },

      title: {
        text: 'Infractions enregistrées par la police, ' + (2002 + i)
      },

      subtitle: {
        text: 'Source map: <a href="http://code.highcharts.com/mapdata/custom/europe.js">Europe</a>'
      },

      mapNavigation: {
        enabled: true,
        buttonOptions: {
          verticalAlign: 'bottom'
        }
      },

      colorAxis: {
        min: 0
      },

      series: [{
        data: data1[i],
        name: 'Nombre (en milliers)',
        states: {
          hover: {
            color: '#BADA55'
          }
        },
        dataLabels: {
          enabled: true,
          format: '{point.name}'
        }
      }]
    });
  });
}

// variables nécessaire à la création des données du second tableau.
let data2 = [];
let tbody2 = document.querySelectorAll("#table2 tbody > tr");

//Boucles de traitements
for (let i = 0; i < tbody2.length; i++) {
  let tds = tbody2[i].getElementsByTagName("td");
  data2.push({
    "pays": tds[0].textContent,
    "année": "2007-09",
    "data": parseInt(tds[1].textContent)
  });
  data2.push({
    "pays": tds[0].textContent,
    "année": "2010-12",
    "data": parseInt(tds[2].textContent)
  });
}

let table2 = document.querySelector("#table2");
let chartDiv = document.createElement("div");
chartDiv.setAttribute("id", "chart");
table2.parentNode.insertBefore(chartDiv, table2);

var svg = dimple.newSvg("#chart", "100%", 450);
var myChart = new dimple.chart(svg, data2);
myChart.setBounds(30, 110, "90%", 305);
var x = myChart.addCategoryAxis("x", ["année", "pays"]);
var y = myChart.addMeasureAxis("y", "data");
y.ticks = 20;
myChart.addSeries("pays", dimple.plot.bar);
var myLegend = myChart.addLegend(10, 10, "100%", 200, "Right");
myChart.draw();

// This is a critical step.  By doing this we orphan the legend. This
// means it will not respond to graph updates.  Without this the legend
// will redraw when the chart refreshes removing the unchecked item and
// also dropping the events we define below.
myChart.legends = [];

// This block simply adds the legend title. I put it into a d3 data
// object to split it onto 2 lines.  This technique works with any
// number of lines, it isn't dimple specific.
svg.selectAll("title_text")
  .data([""])
  .enter()
  .append("text")
  .attr("x", 499)
  .attr("y", function(d, i) {
    return 90 + i * 14;
  })
  .style("font-family", "sans-serif")
  .style("font-size", "10px")
  .style("color", "Black")
  .text(function(d) {
    return d;
  });

// Get a unique list of Owner values to use when filtering
var filterValues = dimple.getUniqueValues(data2, "pays");
// Get all the rectangles from our now orphaned legend
myLegend.shapes.selectAll("rect")
  // Add a click event to each rectangle
  .on("click", function(e) {
    // This indicates whether the item is already visible or not
    var hide = false;
    var newFilters = [];
    // If the filters contain the clicked shape hide it
    filterValues.forEach(function(f) {
      if (f === e.aggField.slice(-1)[0]) {
        hide = true;
      } else {
        newFilters.push(f);
      }
    });
    // Hide the shape or show it
    if (hide) {
      d3.select(this).style("opacity", 0.2);
    } else {
      newFilters.push(e.aggField.slice(-1)[0]);
      d3.select(this).style("opacity", 0.8);
    }
    // Update the filters
    filterValues = newFilters;
    // Filter the data
    myChart.data = dimple.filterData(data2, "pays", filterValues);
    // Passing a duration parameter makes the chart animate. Without
    // it there is no transition
    myChart.draw(800);
  });
