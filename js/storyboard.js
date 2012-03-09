function Storyboard(game)
{
	this.data	= {};
	this.game	= game;
}

Storyboard.prototype.draw = function()
{
	return;
	//TODO finish this
	
	for(i in this.game.osu.Events)
	{
		switch(this.game.osu.Events[i][0])
		{
			case 'Sprite':
				//Sprite,Background,Centre,"sprogbg.jpg",320,240
				var image = this.data[this.game.osu.Events[i][3]];
			break;
		}
	}
}

Storyboard.prototype.init = function()
{
	$(document.body).css('background', '');
	
	for(i in this.game.osu.Events)
	{
		switch(this.game.osu.Events[i][0])
		{
			case 3:
				//color
				$(this.game.canvas).css('backgroundColor', "rgb(" + this.game.osu.Events[i][2] + "," + this.game.osu.Events[i][3] + "," + this.game.osu.Events[i][4] + ")");
			break;
				
			case 0:
				//background
				if(this.game.osu.Events[i][2].split('.').slice(-1)[0].toLowerCase() == 'jpg'
				|| this.game.osu.Events[i][2].split('.').slice(-1)[0].toLowerCase() == 'jpeg'
				|| this.game.osu.Events[i][2].split('.').slice(-1)[0].toLowerCase() == 'png')
				$(this.game.canvas).css('backgroundImage', "url('" + Setting.Path.BeatMap + this.game.osu.Metadata.id + "/" + this.game.osu.Events[i][2] + "')");
			
				else log(this.game.osu.Events[i][2]);
			break;
		}
	}
}

Storyboard.prototype.load = function()
{
	var id = this.game.osu.Metadata.id;
	
	for(i in this.game.osu.Events)
	{
		if(	this.game.osu.Events[i][0] == 0//if background
			&&
			(
				this.game.osu.Events[i][2].split('.').slice(-1)[0].toLowerCase() == 'jpg'
				|| this.game.osu.Events[i][2].split('.').slice(-1)[0].toLowerCase() == 'jpeg'
				|| this.game.osu.Events[i][2].split('.').slice(-1)[0].toLowerCase() == 'png'
			)// ↑ if image (≠ movie)
		)
		{
			var img = new loader();
			img.url = Setting.Path.BeatMap + id + "/" + this.game.osu.Events[i][2];
			img.type = "img";
			//just load, will be triggered with url via css
			img.start();
		}
		
		else if(this.game.osu.Events[i][0] ==  'Sprite'
			&&
			(
				this.game.osu.Events[i][3].split('.').slice(-1)[0].toLowerCase() == 'jpg'
				|| this.game.osu.Events[i][3].split('.').slice(-1)[0].toLowerCase() == 'jpeg'
				|| this.game.osu.Events[i][3].split('.').slice(-1)[0].toLowerCase() == 'png'
			)
		)
		{
			var img = new loader();
			img.url = Setting.Path.BeatMap + id + "/" + this.game.osu.Events[i][3];
			img.type = "img";
			img.extra.basename = this.game.osu.Events[i][3];
			img.extra.self = this;
			img.callback = function(array)
			{
				array.extra.self.data[array.extra.basename] = array.data;
			}
			img.start();
		}
	}
}
