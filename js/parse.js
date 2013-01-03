function cleanOSU(input)
{
	//parseFloat everything :p
	//removes spaces at end and beginning
	//removes useless ["]
	//resets array keys
	
	//Infinity is accepted ! // maybe also true & false → FIXME
	
	if(typeof input == 'string')
	{
		input = input.trim().replace(/^\"(.*)\"$/g, "$1");
		return (parseFloat(input) == input) ? parseFloat(input) : input;
	}
	else if(input instanceof Array || input instanceof Object)
	{
		if(input instanceof Array)//cleans array if some values are deleted
			var temp = [];
		
		for(i in input)
		{
			if(input[i] !== null)
			{
				if(input instanceof Array)
				{
					temp.push(cleanOSU(input[i]));
				}
				else	input[i] = cleanOSU(input[i]);
			}
		}
		
		if(input instanceof Array)
			input = temp;

		return input;
	}
}

String.prototype.trim = function()
{
	return this.replace(/(^\s+|\s+$)/g, '');
}

function parseOSU(osu_file)
{
	var return_array = {};

	var cat = osu_file.replace(/(^\s+|\s+$)/g, '').replace(/\n\n\n+/g, "\n\n").split("\n\n");

	//parse
	for(i in cat)//chaque catégorie
	{
		if(cat[i].indexOf("\n") != -1)
		{
			var info = cat[i].split("\n");
			info[0] = info[0].replace(/(^\[|\]$)/g, '').trim();

			if(info[0] != "Events" && info[0] != "TimingPoints" && info[0] != "HitObjects")
			{
				var temp = {};
	
				for(j in info)//chaque ligne
				{
					if(j != 0)
					{
						var value = info[j].split(':');
			
						value[0] = value[0].trim();
						value[1] = value[1].trim();
			
						temp[value[0]] = (value[1].indexOf(',') == -1) ? value[1] : value[1].split(',');
						// ^ fix comboColor
					}
				}
	
				return_array[info[0]] = temp;
			}
			else
			{
				if(info[0] == 'Events') var latest;
				
				for(j in info)//chaque ligne
				{
					if(info[j].indexOf('//') != 0)
					{
						var indent = (info[0] == 'Events' && (info[j][0] === ' ' || info[j][0] === '_'));
						
						if(info[j].indexOf(',') != -1)
						{
							info[j] = info[j].split(',');
							for(k in info[j])
							{
								if(info[j][k].indexOf('|') != -1)
								{
									info[j][k] = info[j][k].split('|');
									for(l in info[j][k])
									{
										if(info[j][k][l].indexOf(':') != -1)
										{
											info[j][k][l] = info[j][k][l].split(':');
										}
									}
								}
							}
						}
						
						if(indent)
						{
							info[latest].push(info[j]);
							delete info[j];
						}
						else	latest = j;
					}
					
					else	delete info[j];
				}
	
				//return_array[info[0]] = (info.length > 2) ? info.slice(1) : info[1];
				return_array[info[0]] = info.slice(1);//envoie la catégorie
				// ^ make my life easier when using values (no need to check whether it's an array)
			}
		}
	}

	return cleanOSU(return_array);
}
