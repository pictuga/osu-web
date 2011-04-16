//sample
{
	Metadata : 
	{
		//idées prises des paquets deb "man deb-control"
		
		Package : "volume",
		Maintainer : "TheCaméléon",
		Description : "Règle le son depuis le menu",
		Homepage : "http://pictuga.tk/"
		//Depends
		//Conflicts
	},
	
	Running : true,
	ActivationKey : "m",
	
	Functions : 
	{
		//dés-active le greffon
		switchOn : function(){},
		switchOff : function(){},
		
		//fonctions pré-existantes
		initBeatMap : function(){},
		updateBeatMap : function(){},
		resizeBeatMap : function(){},
		
		//événements du jeu
		end : function(){},
		
		//events
		load : function(){}
	}
}
