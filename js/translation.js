function loadTranslation()
{
	var tr = new loader();
	tr.url = "translation.txt";
	tr.type = "ajax";
	tr.callback = function(array)
	{
		var lang = array.xhr.getResponseHeader('Content-location').split('.').slice(-1)[0];
		
		if(lang == "en")
		{
			//
		}
		else
		{
			//need to get .en in case of missing translations, since .en will be done first
		}
		
		parseTranslation(array.data);
	}
	tr.start();
}

function parseTranslation(input)
{
	input = input.newLine.split('\n').slice(0, -1);
	for(var i in input)
	{
		var line = input[i].split('=', 2);
		TRANSLATION[line[0]] = line[1].replace(/\\n/g, "\n").replace(/\\t/g, "\t");
		//↑ dirty, but works
	}
}

var TRANSLATION = {};

function _(key)
{
	return TRANSLATION[key];
}
