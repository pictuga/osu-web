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
			if(player.ended) return false;
			
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
