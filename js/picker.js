function pickBeatMap()
{
	if(document.getElementById("pdiv")) document.body.removeChild(document.getElementById("pdiv"));
	
	var pdiv = document.createElement("div");
	pdiv.id = "pdiv";
	
	for(id in beatmap)
	{
		var osz = document.createElement("div");
		osz.innerHTML = beatmap[id].title;
		
		for(i in beatmap[id].version)
		{
			var osu = document.createElement("div");
			osu.innerHTML = (beatmap[id].version[i] != '') ? beatmap[id].version[i] : '[no name]';
			
			osu.onclick =
			(
				function(id, i)
				{
					return function()
					{
						document.body.removeChild(document.getElementById("pdiv"));
						
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
							mp3.url = [BEATMAP + osu_file.Metadata.id + "/" + osu_file.General.AudioFilename, "/beatmap/conv/" + osu_file.Metadata.id + ".ogg"];
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
			)(id, i);
			
			//http://www.siteduzero.com/tutoriel-3-123380-les-closures-en-javascript.html
			//http://www.howtocreate.co.uk/referencedvariables.html
			
			osz.appendChild(osu);
		}
		
		pdiv.appendChild(osz)
	}
	
	document.body.appendChild(pdiv);
}
