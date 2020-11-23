"use strict";
Number.prototype.pad=function(size){let s=String(this);while(s.length<(size||2)){s="0"+s;}return s;};
Number.prototype.sepThousands=function(sep){let p=String(this).split(".");p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,sep);return p.join(".");};
var getData=(url,callback)=>{let request=new XMLHttpRequest();request.addEventListener("load",()=>{request.responseText&&request.status<400?callback(request.responseText):console.log("Request failed: "+(request.responseText?request.responseText:"Error "+request.status));});request.open("GET",url);request.send()};
var getMETAR=(loop, SWbound, NEbound, date=[false,false,false], h=false, m=false)=>{
	let corsanywhere = "https://siweather.herokuapp.com/";
	let url = corsanywhere+"www.aviationweather.gov/cgi-bin/json/MetarJSON.php?bbox="+SWbound[0]+","+SWbound[1]+","+NEbound[0]+","+NEbound[1];
	url+=(date[0]?"&date="+date[0].pad(4)+date[1].pad(2)+date[2].pad(2)+h.pad(2)+m.pad(2):"");
	getData(url, data=>{
		let weather=JSON.parse(data).features[1];
		if (!weather) {throw "Data Not Found";}
		weather=weather.properties;
		let rows = document.getElementById("weather").getElementsByTagName("tr").length;
		let newRow=document.getElementById("weather").insertRow(-1),currentCell;
		currentCell=newRow.insertCell(-1);
		currentCell.appendChild(document.createTextNode(rows));
		currentCell=newRow.insertCell(-1);
		currentCell.appendChild(document.createTextNode((Date.parse(weather.obsTime)/1000).sepThousands(" ")+" s"));
		currentCell=newRow.insertCell(-1);
		currentCell.appendChild(document.createTextNode((weather.temp+273.2).toFixed(1)+" K"));
		currentCell=newRow.insertCell(-1);
		currentCell.appendChild(document.createTextNode((weather.dewp+273.2).toFixed(1)+" K"));
		currentCell=newRow.insertCell(-1);
		currentCell.appendChild(document.createTextNode((weather.wspd*463/900).toFixed(1)+" m\u22C5s\u207B\u00B9"));
		currentCell=newRow.insertCell(-1);
		currentCell.appendChild(document.createTextNode(weather.wdir!=360?weather.wdir+"\u00B0":"0\u00B0"));
		currentCell=newRow.insertCell(-1);
		currentCell.appendChild(document.createTextNode((weather.wgst?(weather.wgst*463/900).toFixed(1)+" m\u22C5s\u207B\u00B9":"None")));
		currentCell=newRow.insertCell(-1);
		currentCell.appendChild(document.createTextNode((weather.ceil?(weather.ceil*30.48).toFixed(1)+" m":"None")));
		currentCell=newRow.insertCell(-1);
		let wx = weather.wx;
		let _condition=(weather.cover=="SKC"||weather.cover=="NCD"||weather.cover=="CLR"||weather.cover=="NSC"?"Clear":weather.cover=="FEW"?"Few Clouds (<25% of sky covered)":weather.cover=="SCT"?"Scattered Clouds (25-50% of sky covered)":weather.cover=="BKN"?"Broken Clouds (>50% of sky covered)":weather.cover=="OVC"?"Overcast (100% of sky covered)":"Clouds are covered")+(weather.wx?"; ":""),conditions=[["-","Light"],["+","Heavy"],["VC","Nearby"],["MI","Shallow"],["PR","Partial"],["BC","Patches of"],["DR","Low Drifting"],["BL","Blowing"],["SH","Shower"],["TS","Thunderstorm"],["FZ","Freezing"],["DZ","Drizzle"],["RA","Rain"],["SN","Snow"],["SG","Snow Grains"],["IC","Ice Crystals"],["PL","Ice Pellets"],["GR","Hail"],["GS","Snow Pellets/Small Hail"],["UP","Unknown Precipitation"],["BR","Mist"],["FG","Fog"],["FU","Smoke"],["VA","Volcanic Ash"],["DU","Widespread Dust"],["SA","Sand"],["HZ","Haze"],["PY","Spray"],["PO","Developed Dust/Sand Whirls"],["SQ","Squalls"],["FC","Funnel Clouds"],["SS","Sandstorm"],["DS","Duststorm"]];
		for(let condition of conditions) wx?(wx.indexOf(condition[0])!=-1?_condition+=(condition[1]+' '):0):0;
		currentCell.appendChild(document.createTextNode(_condition));
		currentCell=newRow.insertCell(-1);
		currentCell.appendChild(document.createTextNode((weather.visib*1.609344).toFixed(1)+" km"));
		currentCell=newRow.insertCell(-1);
		currentCell.appendChild(document.createTextNode((weather.altim/100).toFixed(3)+" kg\u22C5m\u207B\u00B9\u22C5s\u207B\u00B2"));
		currentCell=newRow.insertCell(-1);
		currentCell.appendChild(document.createTextNode(weather.slp?((weather.slp/100).toFixed(3)+" kg\u22C5m\u207B\u00B9\u22C5s\u207B\u00B2"):((weather.altim/100).toFixed(3)+" kg\u22C5m\u207B\u00B9\u22C5s\u207B\u00B2")));
		if(loop){
			let t=weather.obsTime,d=[parseInt(t.substring(0,4)),parseInt(t.substring(5,7)),parseInt(t.substring(8,10))],h=parseInt(t.substring(11,13));
			getMETAR(true,SWbound,NEbound,d,h-1,59);
		}
	});
};
getMETAR(true, [-98,32], [-97,33]);
