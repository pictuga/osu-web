var addons = [];

function runAddons(event)
{
	for(key in addons)
	{
		if(isFunction(addons[key].Functions[event]))
		{
			if(addons[key].Running)
			{
				addons[key].Functions[event]();
			}
		}
	}
	
	return event;
}
