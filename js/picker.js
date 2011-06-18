function pickBeatMap()
{
	$('#pdiv').remove();
	
	var pdiv = $('<div id="pdiv"/>').appendTo(document.body);
	
	var out = sortBeatmap();
	for(var i in out)
	{
		var id = out[i];
		
		var osz = $('<div/>', {html: beatmap[id].title}).appendTo(pdiv);
		
		for(i in beatmap[id].version)
		{
			var version = beatmap[id].version[i];
			var osu = $('<div/>', {html: (version != '') ? version : '[no name]'}).appendTo(osz);
			
			osu.click({id: id, version: version}, function(event)
			{
				$('#pdiv').remove();
				loadBeatMap(event.data.id, event.data.version);
			});
		}
	}
}
