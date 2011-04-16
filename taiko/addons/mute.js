{
	Metadata : 
	{
		Package : "mute",
		Maintainer : "TheCaméléon",
		Description : "Coupe le son",
		Homepage : "http://pictuga.tk/"
	},
	
	Running : false,
	ActivationKey : "m",
	
	Functions : 
	{
		switchOn : function()
		{
			player.volume = 0;
			alert("music off");
		},
		switchOff : function()
		{
			player.volume = 1;
			alert("music on");
		}
	}
}
