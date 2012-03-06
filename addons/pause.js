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
			if(Games.slice(-1)[0].player.ended) return false;
			
			if(Games.slice(-1)[0].player.paused)
				Games.slice(-1)[0].player.play();
			else	Games.slice(-1)[0].player.pause();
		}
	}
}
