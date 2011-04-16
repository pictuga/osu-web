{
	Metadata : 
	{
		//idées prises des paquets deb "man deb-control"
		
		Package : "debug",
		Maintainer : "TheCaméléon",
		Description : "Affiche diverses informations de debug",
		Homepage : "http://pictuga.tk/"
		//Depends
		//Conflicts
	},
	
	Running : false,
	ActivationKey : "d",
	
	Functions : 
	{
		//fonctions pré-existantes
		updateBeatMap : function()
		{
			alert(player.currentTime + "/" + player.duration);
		},
		resizeBeatMap : function()
		{
			alert(W + "/" + H);
		},
		
		//événements du jeu
		end : function()
		{
			alert(time());
		}
	}
}
