{
	Metadata : 
	{
		Package : "pause",
		Maintainer : "TheCaméléon",
		Description : "Play / Pause",
		Homepage : "http://pictuga.tk/"
	},
	
	Running : false,
	ActivationKey : "p",
	
	Functions : 
	{
		switchOnOff : function()
		{
			if(player.paused)
			{
				removejWindow();
				player.play();
			}
			else
			{
				alert('pause');
				player.pause();
			}
		}
	}
}
