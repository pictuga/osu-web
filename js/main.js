var BEATMAP = "/beatmap/";
var readme;

$(document).ready(function()
{
	setTimeout("main();", 0);
});

var main = function()
{
	loaded = function()
	{
		var button = document.createElement("input");
		button.type = "button";
		button.value = _('BM_PICK') + " →";
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
