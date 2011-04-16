function pickBeatMap()
{
	if(document.getElementById("pdiv")) document.body.removeChild(document.getElementById("pdiv"));
	
	var pdiv = document.createElement("div");
	pdiv.id = "pdiv";
	
	for(key in beatmap)
	{
		var osz = document.createElement("div");
		var first = true;
		
		for(i in beatmap[key])
		{
			if(first)
			{
				osz.innerHTML = beatmap[key][i].Metadata.Title;
				first = false;
			}
			
			var osu = document.createElement("div");
			osu.innerHTML = (beatmap[key][i].Metadata.Version != '') ? beatmap[key][i].Metadata.Version : '[no name]';
			
			osu.onclick =
			(
				function(key, i)
				{
					return function()
					{
						document.body.removeChild(document.getElementById("pdiv"));

						osu_file = beatmap[key][i];
						
						loadStoryBoard();
						
						var mp3 = new loader();
						mp3.url = ["/beatmap/" + key + "/" + osu_file.General.AudioFilename, "/beatmap/conv/" + key + ".ogg"];
						mp3.type = "audio";
						mp3.callback = function(array)
						{
							player = array.data;
						}
						mp3.start();
					}
				}
			)(key, i);
			
			//http://www.siteduzero.com/tutoriel-3-123380-les-closures-en-javascript.html
			//http://www.howtocreate.co.uk/referencedvariables.html
			
			osz.appendChild(osu);
		}
		
		pdiv.appendChild(osz)
	}
	
	document.body.appendChild(pdiv);
}
