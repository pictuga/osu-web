function listFolder(folder)
{
	var param = (arguments[1] != undefined) ? arguments[1].split(' ') : [];
	
	function isParam(val)
	{
		var i;
		for (i in param)
		{
			if (param[i] == val)
			{
				return true;
			}
		}
		return false;
	}
	
	if(!isParam('dl'))
	{
		var xhr = new XMLHttpRequest();
		
		xhr.open("POST", folder, false);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send(null);

		var index = xhr.responseText;
	}
	else	var index = folder;

	var result_array = [];

	$('<div/>', {html: index}).find('a').each(function()
	{
		var url = decodeURI(this.getAttribute('href'));
		if(url[0] != '?' && url[0] != "/")
		{
			var info = {};
		
			info.url =	url;
			info.basename = (info.url.slice(-1) != "/")
				? (info.url.indexOf('.') != -1)
					? info.url.split('.').slice(0, -1).join('.')
					: info.url
				: info.url.split('/')[0];
			info.ext =	(info.url.slice(-1) != '/')
				? (info.url.indexOf('.') != -1)
					? info.url.split('.').slice(-1)[0].toLowerCase()
					: ''
				: '/';
	
			result_array.push(info);
		}
	});
	
	if(isParam('ext') || !isParam('full'))
	{
		if(isParam('ext'))	var temp = {};
		else			var temp = []; 
		
		for(i in result_array)
		{
			if(isParam('ext'))
			{
				var ext = result_array[i].ext;
				if(temp[ext] == undefined) temp[ext] = [];
				
				if(!isParam('full'))
					temp[ext].push(result_array[i].url);
				else	temp[ext].push(result_array[i]);
			}
			else
			{
				if(!isParam('full'))
					temp.push(result_array[i].url);
				else	temp.push(result_array[i]);
			}
		}

		result_array = temp;
	}
	return result_array;
}
