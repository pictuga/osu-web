{
	Metadata : 
	{
		Package : "pause",
		Maintainer : "TheCaméléon",
		Description : "Play / Pause",
		Homepage : "http://pictuga.com/"
	},
	
	Running : false,
	ActivationKey : "p",
	
	Functions : 
	{
		switchOnOff : function()
		{
			if(Game.player.ended) return false;
			
			if(Game.player.paused)
				Game.play();
			else	Game.pause();
		}
	}
}
