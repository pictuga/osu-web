var sb = {};//contains Storyboard images

function drawStoryBoard()
{
	return;
	
	for(i in osu_file.Events)
	{
		if(osu_file.Events[i][0] == 'Sprite')//fixe
		{
			//Sprite,Background,Centre,"sprogbg.jpg",320,240
			var image = sb[osu_file.Events[i][3]];
			//FIXME needs doc !
		}
		
		//+ animations
	}
}

function initStoryBoard()
{
	canvas.css('background', '');
	
	for(i in osu_file.Events)
	{
		if(osu_file.Events[i][0] == 3)//color
		{
			canvas.css('backgroundColor', "rgb(" + osu_file.Events[i][2] + "," + osu_file.Events[i][3] + "," + osu_file.Events[i][4] + ")");
		}
		
		if(osu_file.Events[i][0] == 0)//background
		{
			if(osu_file.Events[i][2].split('.').slice(-1)[0].toLowerCase() == 'jpg'
			|| osu_file.Events[i][2].split('.').slice(-1)[0].toLowerCase() == 'jpeg'
			|| osu_file.Events[i][2].split('.').slice(-1)[0].toLowerCase() == 'png')
			canvas.css('backgroundImage', "url('" + BEATMAP + osu_file.Metadata.id + "/" + osu_file.Events[i][2] + "')");
			
			else log(osu_file.Events[i][2]);
		}
	}
}

function loadStoryBoard()
{
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
			img.url = BEATMAP + id + "/" + osu_file.Events[i][2];
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
			img.url = BEATMAP + id + "/" + osu_file.Events[i][3];
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
