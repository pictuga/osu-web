var load = [];

function loader()
{
	this.state = 0;// 0 empty // 1 en cours // 2 fini
	this.type = null; //img/js/ajax/folder/audio // /video?
	this.url = null;
	
	this.data = null;
	this.extra = [];
	
	this.id = null;
}
	
	loader.prototype.done = function()
	{
		if(this.state == 2) return;
		
		switch(this.type)
		{
			case "folder":
				this.data = (this.extra.param != undefined) ? listFolder(this.data, (this.extra.param + ' dl')) : listFolder(this.data, 'dl');
			break;
			
			case "audio":
				this.data.removeEventListener('canplaythrough', function(){load[id].done();}, true);
				this.data.oncanplaythrough =  undefined;
			break;
		}
		
		this.state = 2;
		if(isFunction(this.callback))
			this.callback(this);
		
		checkLoad();
	}
	
	loader.prototype.error = function()
	{
		log('loader fail', this);
		this.state = 3;
	}
	
	loader.prototype.start = function()
	{
		this.id = (load.push(this)-1);
		var id = this.id;
		
		checkLoad();
		
		this.state = 1;
		
		switch(this.type)
		{
			case "img":
				this.data = new Image();
				this.data.onload = function(){load[id].done();}
				this.data.onerror = function(){load[id].error();}
				this.data.src = this.url;
			break;
		
			case "audio":
				this.data = new Audio();
				if(!this.extra.skip)
				{
					this.data.addEventListener('canplaythrough', function(){load[id].done();}, true);
					this.data.oncanplaythrough = function(){load[id].done();}
					this.data.onerror = function(){load[id].error();}
				}
			
				if(this.url instanceof Array)
					this.data.src = (this.data.canPlayType('audio/ogg') == "probably" || this.data.canPlayType('audio/ogg') == "maybe") ? this.url[1] : this.url[0];
				else	this.data.src = this.url;
			
				this.data.load();
			
				if(this.extra.skip) this.done();
			break;
		
			case "js":
				for (param in this.extra.param)
				{
			 		if (url.indexOf("?") != -1)
			 		{
						this.url += "&";
					}  else
					{
						this.url += "?";
					}
					this.url += encodeURIComponent(param) + "=" +  encodeURIComponent(this.extra.param[param]);
				}
			
				this.data = document.createElement("script");
				this.data.onload = function(){load[id].done()};
				this.data.type = "text/javascript";
				this.data.src = this.url;
				document.body.appendChild(this.data);
			break;
		
			case "ajax":
			case "folder":
				var xhr = getXMLHttpRequest();
			
				if (xhr && xhr.readyState != 0) {
					xhr.abort();
					delete xhr;
				}

				xhr.onreadystatechange = function()
				{
					if (xhr.readyState == 4)
					{
						if(xhr.status == 200)
						{
							load[id].data = xhr.responseText;
							load[id].done();
						}
						else if(xhr.status >= 400)
						{
							load[id].error();
						}
					}
				}
			
				var url = (this.type == "ajax") ? this.url : this.url.replace(/\/+$/gi, '');
			
				xhr.open("GET", url, true);
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xhr.send(null);
			break;
		}
	}

function checkLoad()
{
	var counter = 0;
	for(i in load)
	{
		if(load[i].state == 2) counter++;
	}
	
	if(counter == load.length)
	{
		body.removeChild(document.getElementById("loader"));
		if(typeof osu_file == 'undefined')
		{
			localStorage.setObject('beatmap', beatmap);
			localStorage.setObject('time', tbeatmap);
			
			var button = document.createElement("input");
			button.type = "button";
			button.value = "Pick a beatmap →";
			button.onclick = function(){pickBeatMap();}
			document.getElementById("pdiv").appendChild(button);
		}
		else
		{
			initBeatMap();
		}
	}
	else showLoader(counter/load.length*100);
	
	return counter;
}


function checkFail()
{
	for(i in load)
	{
		if(load[i].state != 2) log('!', load[i].url, load[i].type);
	}
}

function isLoaded(obj)
{
	return (obj.state == 2);
}

function showLoader(progress)
{
	if(!document.getElementById("loader"))
	{
		var loader_div = document.createElement("div");
		loader_div.id = "loader";
		
		var progress = document.createElement("div");
		var input = document.createElement("input");
		input.type = "button";
		progress.appendChild(input);
		
		loader_div.appendChild(progress);
		body.appendChild(loader_div);
	}
	
	document.getElementById("loader").getElementsByTagName("div")[0].style.width = progress + "%";
	document.getElementById("loader").getElementsByTagName("input")[0].value = Math.ceil(progress) + "%";
}


//////////////////////////////////////////

function loadAddons()
{
	var addon_loader = new loader();
	addon_loader.url = "addons";
	addon_loader.type = "folder";
	addon_loader.callback = function(array)
	{
		array = array.data;
		
		for(key in array)
		{
			var url = "addons/" + array[key];
			
			var new_addon = new loader();
			new_addon.url = url;
			new_addon.type = "ajax";
			new_addon.callback = function(array)
			{
				var new_addon = eval('('+array.data+')');
				addons[new_addon.Metadata.Package] = new_addon;
			}
			new_addon.start();
		}
	}
	addon_loader.start();
}

var pic = {};

function loadImages()
{
	var pic_loader = new loader();
	pic_loader.url = "images";
	pic_loader.type = "folder";
	pic_loader.extra.param = "full";
	pic_loader.callback = function(array)
	{
		array = array.data;
		
		for(key in array)
		{
			var url = "images/" + array[key].url;
			var basename = array[key].basename;
			
			var new_pic = new loader();
			new_pic.url = url;
			new_pic.extra.basename = basename;
			new_pic.type = "img";
			new_pic.callback = function(array)
			{
				pic[array.extra.basename] = array.data;
			}
			new_pic.start();
		}
	}
	pic_loader.start();
}

function loadJS()
{
	var js_array = ['beatmap', 'hitcircle', 'addons', 'slider', 'spinner', 'picker', 'sb', 'menu', 'curves'];
	
	for(key in js_array)
	{
		var new_js = new loader();
		new_js.url = "js/" + js_array[key] + ".js";
		new_js.type = "js";
		new_js.extra.basename = js_array[key];
		new_js.callback = function(array)
		{
			switch(array.extra.basename)
			{
				case "addons":
					loadAddons();
					break;
			}
		}
		new_js.start();
	}
}

var beatmap = {};
var tbeatmap= {};

var cache;
var tcache;//cache time beatmaps folder

function loadBeatMap()
{
	if(localStorage && typeof JSON !='undefined')
	{
		if(localStorage.getObject('beatmap') != false)
			cache = localStorage.getObject('beatmap');
		else	delete cache;
		
		if(localStorage.getObject('time') != false)
			tcache = localStorage.getObject('time');
		else	delete tcache;
	}
	else
	{
		delete cache;
		delete tcache;
	}

	//list osz (folders)
	var ls = new loader();
	ls.url = "/beatmap/";
	ls.type = "folder";
	ls.extra.param = "full";
	ls.callback = function(array)
	{
		for(i in array.data)
		{
			if(array.data[i].url != "conv/")
			{
				//check
				var id = array.data[i].basename;
				
				if(typeof tcache == 'object'
				&& typeof cache == 'object'
				&& typeof cache[id] != 'undefined'
				&& tcache[id] == array.data[i].time)
				{
					beatmap[id] = cache[id];
					tbeatmap[id] = array.data[i].time;
				}
				else
				{
					log('uncached', id, array.data[i].time);
					tbeatmap[id] = array.data[i].time;
					
					//list osu
					var bms = new loader();
					bms.url = array.url + array.data[i].url;
					bms.type = "folder";
					bms.extra.param = 'ext full';
					bms.callback = function(array)
					{
						if(typeof array.data.mp4 != 'undefined'
						|| typeof array.data.mov != 'undefined'
						|| typeof array.data.avi != 'undefined'
						|| typeof array.data.mpg != 'undefined'
						|| typeof array.data.mpeg != 'undefined')
							log('movie', array.url);
					
						var osu = array.data.osu;
						for(j in osu)
						{
							//get osu
						
							//check cache
							var id = array.url.replace(/^.+\/([0-9]+)\/.*$/gi, "$1");
							var version = osu[j].url.replace(/^.*\[(.*?)\]\.osu$/g, "$1");
							
							if(typeof cache == 'object' &&
							typeof cache[id] != 'undefined'
							&& typeof cache[id][version] != 'undefined'
							&& typeof cache[id][version].Metadata != 'undefined'
							&& typeof cache[id][version].Metadata.time != 'undefined')
							{
								var cache_time = cache[id][version].Metadata.time;
								cached = (cache_time == osu[j].time);
								log('uncached', id, version);
								
								if(typeof beatmap[id] == 'undefined') beatmap[id] = {};
								beatmap[id][version] = cache[id][version];
							}
							else
							{
								var bm = new loader();
								bm.url = array.url + osu[j].url;
								bm.type = "ajax";
								bm.extra.time = osu[j].time;
								bm.callback = function(array)
								{
									var id = array.url.replace(/^.+\/([0-9]+)\/.*$/gi, "$1");
							
									if(typeof beatmap[id] == 'undefined') beatmap[id] = {};
							
									var parsed = parseOSU(array.data);
									parsed.Metadata.id = id;
									parsed.Metadata.time = array.extra.time;
							
									beatmap[id][parsed.Metadata.Version] = parsed;
								}
								bm.start();
							}
						}
					}
					bms.start();
				}
			}
		}
	}
	ls.start();
}

function loadReadme()
{
	var bm = new loader();
	bm.url = "readme.txt";
	bm.type = "ajax";
	bm.callback = function(array)
	{
		readme = array.data.replace(/\s*(<\/?h[0-9]+>)\s*/gi, "$1").replace(/\n/gi, "<br />");
		
		var help = document.createElement("div");
		help.id = "pdiv";
		help.innerHTML = readme;
		document.body.insertBefore(help, document.getElementById("loader"));
	}
	bm.start();
}

var sounds = {};

function loadSound()
{
	var sd = new loader();
	sd.url = "sound/";
	sd.type = "folder";
	sd.extra.param = 'ext full';
	sd.callback = function(array)
	{
		array = array.data;
		
		for(i in array.mp3)
		{
			var basename = array.mp3[i].basename;
			
			var mp3 = new loader();
			mp3.url = ["sound/" + basename + '.mp3', "sound/" + basename + '.ogg'];
			mp3.extra.basename = basename;
			mp3.type = "audio";
			mp3.callback = function(array)
			{
				sounds[array.extra.basename] = array.data;
			}
			mp3.start();
		}
	}
	sd.start();
}
