var BEATMAP = "/beatmap/";
var readme;

window.onload = function()
{
	setTimeout("main();", 0);
}

var main = function()
{
	loaded = function()
	{
		var button = document.createElement("input");
		button.type = "button";
		button.value = µ.BM_PICK + " →";
		button.onclick = function(){pickBeatMap()};
		document.getElementById("pdiv").appendChild(button);
	}
	
	loadAll();
}
