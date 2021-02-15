"use strict";
Number.prototype.pad = function(size) {
  let s = String(this);
  while (s.length < (size || 2)) {
    s = "0" + s;
  }
  return s;
};
Number.prototype.sepThousands = function(sep) {
  let p = String(this).split(".");
  p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return p.join(".");
};
var getWindChill = (temp, speed) => {
  let v16 = Math.pow((speed * 3.6), 0.16)
	return 13.12 + 0.6215*temp - 11.37*v16 + 0.3965*temp*v16
}
var getRelativeHumidity = (temp, dewp) => {
	let m = 7.591388, tn = 240.7263;
	return 100 * Math.pow(10, m * ((dewp / (dewp + tn)) - (temp / (temp + tn))));
}
var getHeatIndex = (t, r) => {
	let c1 = -8.78469475556,
		c2 = 1.61139411,
		c3 = 2.33854883889,
		c4 = -0.14611605,
		c5 = -0.012308094,
		c6 = -0.0164248277778,
		c7 = 0.002211732,
		c8 = 0.00072546,
		c9 = -0.000003582;
	return c1 + c2*t + c3*r + c4*t*r + c5*t*t + c6*r*r + c7*t*t*r + c8*t*r*r + c9*t*t*r*r;
}
var getData = (url, callback) => {
  let request = new XMLHttpRequest();
  request.addEventListener("load", () => {
    request.responseText && request.status < 400 ? callback(request.responseText) : console.log("Request failed: " + (request.responseText ? request.responseText : "Error " + request.status));
  });
  request.open("GET", url);
  request.send()
};
var getMETAR = (loop, SWbound, NEbound, date = [false, false, false], h = false, m = false, lastDate = Infinity) => {
  let corsanywhere = "https://siweather.herokuapp.com/";
  let url = corsanywhere + "www.aviationweather.gov/cgi-bin/json/MetarJSON.php?bbox=" + SWbound[0] + "," + SWbound[1] + "," + NEbound[0] + "," + NEbound[1];
  url += (date[0] ? "&date=" + date[0].pad(4) + date[1].pad(2) + date[2].pad(2) + h.pad(2) + m.pad(2) : "");
  console.log("Requesting: " + url);
  getData(url, data => {
    let weather = JSON.parse(data).features[1];
    if (!weather) {
      throw "Data Not Found";
    }
    weather = weather.properties;
    weather.timestamp = Date.parse(weather.obsTime) / 1000;
    weather.windChill = parseFloat(getWindChill(weather.temp, weather.wspd * 463 / 900).toFixed(1));
    weather.relativeHumidity = getRelativeHumidity(weather.temp, weather.dewp);
    weather.heatIndex = parseFloat(getHeatIndex(weather.temp, weather.relativeHumidity).toFixed(1));
    weather.apparent = weather.temp > 18.0 ? weather.heatIndex : weather.windChill;
    if (weather.timestamp >= lastDate && loop) { return }
    let rows = document.getElementById("weather").getElementsByTagName("tr").length;
    let newRow = document.getElementById("weather").insertRow(-1),
      currentCell;
    currentCell = newRow.insertCell(-1);
    currentCell.appendChild(document.createTextNode(rows));
    currentCell = newRow.insertCell(-1);
    currentCell.appendChild(document.createTextNode(weather.timestamp.sepThousands(" ") + " s"));
    currentCell = newRow.insertCell(-1);
    currentCell.appendChild(document.createTextNode((weather.temp + 273.2).toFixed(1) + " K"));
    currentCell = newRow.insertCell(-1);
    currentCell.appendChild(document.createTextNode((weather.dewp + 273.2).toFixed(1) + " K"));
    currentCell = newRow.insertCell(-1);
    currentCell.appendChild(document.createTextNode((weather.wspd * 463 / 900).toFixed(1) + " m\u22C5s\u207B\u00B9"));
    currentCell = newRow.insertCell(-1);
    currentCell.appendChild(document.createTextNode(weather.wdir != 360 ? weather.wdir + "\u00B0" : "0\u00B0"));
    currentCell = newRow.insertCell(-1);
    currentCell.appendChild(document.createTextNode((weather.wgst ? (weather.wgst * 463 / 900).toFixed(1) + " m\u22C5s\u207B\u00B9" : "None")));
    currentCell = newRow.insertCell(-1);
    currentCell.appendChild(document.createTextNode((weather.ceil ? (weather.ceil * 30.48).toFixed(1) + " m" : "None")));
    currentCell = newRow.insertCell(-1);
    let wx = weather.wx;
    let _condition = (weather.cover == "SKC" || weather.cover == "NCD" || weather.cover == "CLR" || weather.cover == "NSC" ? "Clear" : weather.cover == "FEW" ? "Few Clouds (<25% of sky covered)" : weather.cover == "SCT" ? "Scattered Clouds (25-50% of sky covered)" : weather.cover == "BKN" ? "Broken Clouds (>50% of sky covered)" : weather.cover == "OVC" ? "Overcast (100% of sky covered)" : "Clouds are covered") + (weather.wx ? "; " : ""),
      conditions = [
        ["-", "Light"],
        ["+", "Heavy"],
        ["VC", "Nearby"],
        ["MI", "Shallow"],
        ["PR", "Partial"],
        ["BC", "Patches of"],
        ["DR", "Low Drifting"],
        ["BL", "Blowing"],
        ["SH", "Shower"],
        ["TS", "Thunderstorm"],
        ["FZ", "Freezing"],
        ["DZ", "Drizzle"],
        ["RA", "Rain"],
        ["SN", "Snow"],
        ["SG", "Snow Grains"],
        ["IC", "Ice Crystals"],
        ["PL", "Ice Pellets"],
        ["GR", "Hail"],
        ["GS", "Snow Pellets/Small Hail"],
        ["UP", "Unknown Precipitation"],
        ["BR", "Mist"],
        ["FG", "Fog"],
        ["FU", "Smoke"],
        ["VA", "Volcanic Ash"],
        ["DU", "Widespread Dust"],
        ["SA", "Sand"],
        ["HZ", "Haze"],
        ["PY", "Spray"],
        ["PO", "Developed Dust/Sand Whirls"],
        ["SQ", "Squalls"],
        ["FC", "Funnel Clouds"],
        ["SS", "Sandstorm"],
        ["DS", "Duststorm"]
      ];
    for (let condition of conditions) wx ? (wx.indexOf(condition[0]) != -1 ? _condition += (condition[1] + ' ') : 0) : 0;
    currentCell.appendChild(document.createTextNode(_condition));
    currentCell = newRow.insertCell(-1);
    currentCell.appendChild(document.createTextNode((weather.visib * 1.609344).toFixed(1) + " km"));
    currentCell = newRow.insertCell(-1);
    currentCell.appendChild(document.createTextNode((weather.altim / 100).toFixed(3) + " kg\u22C5m\u207B\u00B9\u22C5s\u207B\u00B2"));
    currentCell = newRow.insertCell(-1);
    currentCell.appendChild(document.createTextNode(weather.slp ? ((weather.slp / 100).toFixed(3) + " kg\u22C5m\u207B\u00B9\u22C5s\u207B\u00B2") : ((weather.altim / 100).toFixed(3) + " kg\u22C5m\u207B\u00B9\u22C5s\u207B\u00B2")));
    currentCell = newRow.insertCell(-1);
    currentCell.appendChild(document.createTextNode(weather.relativeHumidity.toFixed(1) + "%"));
    currentCell = newRow.insertCell(-1);
    currentCell.appendChild(document.createTextNode(weather.temp < 27 ? (weather.windChill + 273.2).toFixed(1) + " K" : "None"));
    currentCell = newRow.insertCell(-1);
    currentCell.appendChild(document.createTextNode(weather.temp > 10 ? (weather.heatIndex + 273.2).toFixed(1) + " K" : "None"));
    currentCell = newRow.insertCell(-1);
    currentCell.appendChild(document.createTextNode(weather.rawOb));
    if (loop) {
      let t = weather.obsTime,
        d = [parseInt(t.substring(0, 4)), parseInt(t.substring(5, 7)), parseInt(t.substring(8, 10))],
        h = parseInt(t.substring(11, 13));
      if (h == -1) {
  			h += 24;
  			date[2]--;
  		}
      getMETAR(true, SWbound, NEbound, d, h - 1, 59, weather.timestamp);
    }
  });
};
getMETAR(true, [-98, 32], [-97, 33]);

