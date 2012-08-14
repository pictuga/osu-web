function pickBeatMap()
{
	var div_rm = $('<div/>', {id : 'readme', html : Setting.ReadMe}).appendTo(document.body);
	var picker = $('<div/>', {id : 'picker'}).appendTo(document.body);
	$('html').addClass('scroll');
	
	var out = sortBeatmap();
	for(var i in out)
	{
		var id = out[i];
		var osz = $('<div/>', {html: Data.BeatMap[id].title, 'data-creator': Data.BeatMap[id].creator, 'data-artist': Data.BeatMap[id].artist}).appendTo(picker);
		
		for(i in Data.BeatMap[id].version)
		{
			var version = Data.BeatMap[id].version[i];
			var osu = $('<div/>', {html: (version != '') ? version : '[no name]'}).appendTo(osz);
			osu.click({id: id, version: version}, function(event)
			{
				$('#picker').remove();
				$('#readme').remove();
				$('html').removeClass('scroll');
				new BeatMap(event.data.id, event.data.version);
			});
		}
	}
}

function sortBeatmap()
{
	var ids = {};
	var names = [];
	var out = [];
	
	for(var id in Data.BeatMap)
	{
		ids[Data.BeatMap[id].title.toLowerCase()] = id;
		names.push(Data.BeatMap[id].title.toLowerCase());
	}
	
	names.sort();
	
	for(var i in names)
		out.push(ids[names[i]]);
	
	return out;
}
