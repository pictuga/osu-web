var BEATMAP = "/beatmap/";
var readme;

window.onload = function()
{
	setTimeout("main();", 0);
}

var main = function()
{
	loaded = function(){pickBeatMap();};
	loadAll();
}
