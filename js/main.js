var DefaultSetting =
{
	Path:	{
		BeatMap:	"/beatmap/",
		Conv:		"/conv/",
		Skin:		"/skin/",
		Sound:		"/sound/"
		},
	ReadMe:	"",
	Lang:	(['en', 'fr'].indexOf(navigator.language.split('-')[0] || 'en') != -1) ? navigator.language.split('-')[0] : 'en'
}
var Setting = DefaultSetting;

var Data = 
{
	BeatMap:	{},
	Skin:		{},
	Sound:		{}
}

var Cache = UnStoreObject('beatmap');

var Games = [];
var Game;

window.onload = function()
{
	setTimeout("main();", 0);
}

var main = function()
{
	loaded = function(){
		StoreObject('beatmap', Cache);
		pickBeatMap();
		}
	loadAll();
}
