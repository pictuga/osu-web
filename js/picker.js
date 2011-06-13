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
			
			osu.click({id: id, i: i}, function(event)
			{
				var id = event.data.id;
				var i  = event.data.i; 
				
				$('#pdiv').remove();
				
				loaded = initBeatMap;
				
				var bm = new loader();
				bm.extra.id = id;
				bm.url = BEATMAP + id + "/" + beatmap[id].artist + " - " + beatmap[id].title + " (" + beatmap[id].creator + ") [" + beatmap[id].version[i] + "].osu";
				bm.type = "ajax";
				bm.callback = function(array)
				{
					osu_raw  = array.data;
					osu_id   = array.extra.id;
					
					//helps sb.js
					osu_file = parseOSU(array.data);
					osu_file.Metadata.id = array.extra.id;
					
					loadStoryBoard();
					
					var mp3 = new loader();
					mp3.url = [BEATMAP + osu_id + "/" + osu_file.General.AudioFilename, BEATMAP + "conv/" + osu_id + ".ogg"];
					mp3.type = "audio";
					mp3.callback = function(array)
					{
						player = array.data;
					}
					mp3.start();
				}
				bm.start();
			});
			
			//http://www.siteduzero.com/tutoriel-3-123380-les-closures-en-javascript.html
			//http://www.howtocreate.co.uk/referencedvariables.html
		}
	}
}
