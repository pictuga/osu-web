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
