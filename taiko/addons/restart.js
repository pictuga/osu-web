{
	Metadata : 
	{
		Package : "restart",
		Maintainer : "TheCaméléon",
		Description : "Touche r",
		Homepage : "http://pictuga.tk/"
	},
	
	Running : false,
	ActivationKey : "r",
	
	Functions : 
	{
		switchOnOff : function()
		{
			var ended = player.ended;
			player.pause();
			
			hc = [];
			initBeatMap();
			
			player.currentTime = 0;
			player.play();
			
			if(!timer) autoUpdateBeatMap();
		}
	}
}
