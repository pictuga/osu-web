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
			var osu = $('<div/>', {html: (beatmap[id].version[i] != '') ? beatmap[id].version[i] : '[no name]'}).appendTo(osz);
			
			osu.click(
			(
				function(id, i)
				{
					return function()
					{
						$('#pdiv').remove();
						
						loaded = initBeatMap;
						
						var bm = new loader();
						bm.extra.id = id;
						bm.url = BEATMAP + id + "/" + beatmap[id].artist + " - " + beatmap[id].title + " (" + beatmap[id].creator + ") [" + beatmap[id].version[i] + "].osu";
						bm.type = "ajax";
						bm.callback = function(array)
						{
							osu_file = parseOSU(array.data);
							osu_file.Metadata.id = array.extra.id;
							
							loadStoryBoard();
							
							var mp3 = new loader();
							mp3.url = [BEATMAP + osu_file.Metadata.id + "/" + osu_file.General.AudioFilename, BEATMAP + "conv/" + osu_file.Metadata.id + ".ogg"];
							mp3.type = "audio";
							mp3.callback = function(array)
							{
								player = array.data;
							}
							mp3.start();
						}
						bm.start();
					}
				}
			)(id, i));
			
			//http://www.siteduzero.com/tutoriel-3-123380-les-closures-en-javascript.html
			//http://www.howtocreate.co.uk/referencedvariables.html
		}
	}
}
