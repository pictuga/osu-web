function getXMLHttpRequest()
{
	var xhr = null;
	
	if (window.XMLHttpRequest || window.ActiveXObject)
	{
		if (window.ActiveXObject) {
			try {
				xhr = new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e) {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}
		} else {
			xhr = new XMLHttpRequest();
		}
	} 
	else
	{
		alert("Votre navigateur ne supporte pas l'objet XMLHTTPRequest...");
		return null;
	}
	
	return xhr;
}

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
		var xhr = getXMLHttpRequest();
		if (xhr && xhr.readyState != 0)
		{
			xhr.abort();
			delete xhr;
		}

		folder = folder.replace(/\/+$/gi, '');

		xhr.open("POST", folder, false);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send(null);

		var index = xhr.responseText;
	}
	else
	{
		var index = folder;
	}

	var result_array = [];

	var div = document.createElement("div");
	div.innerHTML = index;
	var links = div.getElementsByTagName("a");
	
	for(var i in links)
	{
		var fullurl = decodeURI(links[i].href);
		
		if(fullurl.indexOf('?') == -1 && links[i].innerHTML != "Parent Directory" && typeof links[i].innerHTML != 'undefined')
		{
			var info = {};
			
			info.url =	fullurl.split('/').slice((fullurl[fullurl.length-1] != "/") ? -1 : -2).join('/');
			info.basename = (info.url[info.url.length-1] != "/")
				? (info.url.indexOf('.') != -1)
					? info.url.split('.').slice(0, -1).join('.')
					: info.url
				: info.url.split('/')[0];
			info.ext =	(info.url[info.url.length-1] != '/')
				? (info.url.indexOf('.') != -1)
					? info.url.split('.').slice(-1)[0].toLowerCase()
					: ''
				: '/';
		
			result_array.push(info);
		}
	}
	
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
