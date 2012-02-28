function pickBeatMap()
{
	var div_rm = $('<div/>', {id : 'readme', html : readme}).appendTo(document.body);
	var picker = $('<div/>', {id : 'picker'}).prependTo(div_rm);
	
	var out = sortBeatmap();
	for(var i in out)
	{
		var id = out[i];
		var osz = $('<div/>', {html: beatmap[id].title}).appendTo(picker);
		
		for(i in beatmap[id].version)
		{
			var version = beatmap[id].version[i];
			var osu = $('<div/>', {html: (version != '') ? version : '[no name]'}).appendTo(osz);
			
			osu.click({id: id, version: version}, function(event)
			{
				$('#picker').remove();
				$('#readme').remove();
				loadBeatMap(event.data.id, event.data.version);
			});
		}
	}
}

function sortBeatmap()
{
	var ids = {};
	var names = [];
	var out = [];
	
	for(var id in beatmap)
	{
		ids[beatmap[id].title.toLowerCase()] = id;
		names.push(beatmap[id].title.toLowerCase());
	}
	
	names.sort();
	
	for(var i in names)
		out.push(ids[names[i]]);
	
	return out;
}
