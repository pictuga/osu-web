var BEATMAP = "/beatmap/";
var readme;

window.onload = function()
{
	setTimeout("main();", 0);
}

var main = function()
{
	loaded = function(){ $('<input/>', {type: 'button', value: µ.BM_PICK + ' →'}).click(pickBeatMap).appendTo('#pdiv'); }	
	loadAll();
}
