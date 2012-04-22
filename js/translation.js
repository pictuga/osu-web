function loadTranslation()
{
	var tr = new loader();
	tr.url = "translation." + Setting.Lang + ".txt";
	tr.type = "ajax";
	tr.callback = function(array)
	{
		parseTranslation(array.data);
	}
	tr.start();
}

var µ = {};

function parseTranslation(input)
{
	var TRANSLATION = {};
	input = input.split('\n').slice(0, -1);
	for(var i in input)
	{
		var line = input[i].split('=', 2);
		TRANSLATION[line[0]] = line[1].replace(/\\n/g, "\n").replace(/\\t/g, "\t");
		//↑ dirty, but works
	}
	µ = TRANSLATION;
}
