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
			player.pause();
			initBeatMap();
		}
	}
}
