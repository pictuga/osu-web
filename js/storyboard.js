var sb = {};//contains Storyboard images

//FIXME no worky, make it a class, inside BeatMap(), with property linking to BeatMap class

function drawStoryBoard()
{
	return;
	//TODO finish this
	
	for(i in osu_file.Events)
	{
		switch(osu_file.Events[i][0])
		{
			case 'Sprite':
				//Sprite,Background,Centre,"sprogbg.jpg",320,240
				var image = sb[osu_file.Events[i][3]];
			break;
		}
	}
}

function initStoryBoard()
{
	return;
	$(document.body).css('background', '');
	
	for(i in osu_file.Events)
	{
		switch(osu_file.Events[i][0])
		{
			case 3:
				//color
				$(document.body).css('backgroundColor', "rgb(" + osu_file.Events[i][2] + "," + osu_file.Events[i][3] + "," + osu_file.Events[i][4] + ")");
			break;
				
			case 0:
				//background
				if(osu_file.Events[i][2].split('.').slice(-1)[0].toLowerCase() == 'jpg'
				|| osu_file.Events[i][2].split('.').slice(-1)[0].toLowerCase() == 'jpeg'
				|| osu_file.Events[i][2].split('.').slice(-1)[0].toLowerCase() == 'png')
				$(document.body).css('backgroundImage', "url('" + Setting.Path.BeatMap + osu_file.Metadata.id + "/" + osu_file.Events[i][2] + "')");
			
				else log(osu_file.Events[i][2]);
			break;
		}
	}
}

function loadStoryBoard()
{
	return;
	var id = osu_file.Metadata.id;
	
	for(i in osu_file.Events)
	{
		if(	osu_file.Events[i][0] == 0//if background
			&&
			(
				osu_file.Events[i][2].split('.').slice(-1)[0].toLowerCase() == 'jpg'
				|| osu_file.Events[i][2].split('.').slice(-1)[0].toLowerCase() == 'jpeg'
				|| osu_file.Events[i][2].split('.').slice(-1)[0].toLowerCase() == 'png'
			)// ↑ if image (≠ movie)
		)
		{
			var img = new loader();
			img.url = Setting.Path.BeatMap + id + "/" + osu_file.Events[i][2];
			img.type = "img";
			img.start();
		}
		
		else if(osu_file.Events[i][0] ==  'Sprite'
			&&
			(
				osu_file.Events[i][3].split('.').slice(-1)[0].toLowerCase() == 'jpg'
				|| osu_file.Events[i][3].split('.').slice(-1)[0].toLowerCase() == 'jpeg'
				|| osu_file.Events[i][3].split('.').slice(-1)[0].toLowerCase() == 'png'
			)
		)
		{
			var img = new loader();
			img.url = Setting.Path.BeatMap + id + "/" + osu_file.Events[i][3];
			img.type = "img";
			img.extra.basename = osu_file.Events[i][3];
			img.callback = function(array)
			{
				sb[array.extra.basename] = array.data;
			}
			img.start();
		}
	}
}
