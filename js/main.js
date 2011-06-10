var osu_file;
var player;

var BEATMAP = "/beatmap/";

window.onload = function()
{
	setTimeout("main();", 0);
}

main = function()
{
	body = document.body;
	
	loaded = function()
	{
		var button = document.createElement("input");
		button.type = "button";
		button.value = "Pick a beatmap →";
		button.onclick = function(){pickBeatMap()};
		document.getElementById("pdiv").appendChild(button);
	}
	
	loadJS();
	loadImages();
	loadBeatMap();
	loadReadme();
	
	//loadAddons(); → moved to loadJS();
	//loadSound(); → buggy for now (once more)
}
