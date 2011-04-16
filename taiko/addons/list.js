{
	Metadata : 
	{
		//idées prises des paquets deb "man deb-control"
		
		Package : "list",
		Maintainer : "TheCaméléon",
		Description : "Liste les beatmap pour copier-coller sur le forum osu!",
		Homepage : "http://pictuga.tk/"
		//Depends
		//Conflicts
	},
	
	Running : false,
	ActivationKey : "l",
	
	Functions : 
	{
		//fonctions pré-existantes
		switchOn : function()
		{
			var str = "";
			for(i in beatmap)
			{
				str += beatmap[i][0].Metadata.Title + "\n[list]";
				
				for(j in beatmap[i])
				{
					str += "[*]" + beatmap[i][j].Metadata.Version;
					if(j != beatmap[i].length-1) str += "\n";
				}
				
				str += "[/list]\n";
			}
			
			alert(str.replace(/\n/gi, "<br />"));
		},
		
		switchOff : function()
		{
			var str = "[list]";
			for(i in beatmap)
			{
				str += "[*]" + beatmap[i][0].Metadata.Title;
				if(i != beatmap.length-1) str += "\n";
			}
			str += "[/list]";
			
			alert(str.replace(/\n/gi, "<br />"));
		}
	}
}
