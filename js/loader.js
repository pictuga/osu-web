var load = [];
var loadID = [];

function newLoader()
{
	loadID.push(load.length);
}

function loader()
{
	this.state = 0;		// 0 empty / 1 wip / 2 done / 3 fail
	this.type = null;	// img / js / ajax / folder / audio
	this.url = null;
	
	this.data = null;
	this.extra = {};
	
	this.id = null;
}
	
	loader.prototype.done = function()
	{
		if(this.state == 2) return;
		this.state = 2;
		
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
		
		if(typeof this.callback == 'function')
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
				delete this.data.autoplay;
				
				this.data.addEventListener('canplaythrough', function(){load[id].done();}, true);
				this.data.oncanplaythrough = function(){load[id].done();}
				this.data.onerror = function(){load[id].error();}
				
				if(this.url instanceof Array)
					this.data.src = (this.data.canPlayType('audio/ogg') == "probably" || this.data.canPlayType('audio/ogg') == "maybe")
						? this.url[1]
						: this.url[0];
				else	this.data.src = this.url;
				
				this.data.load();
			break;
		
			case "js":
				this.data = document.createElement("script");
				this.data.onload = function(){load[id].done()};
				this.data.src = this.url;
				document.head.appendChild(this.data);
			break;
		
			case "ajax":
			case "folder":
				this.xhr = new XMLHttpRequest();
				var xhr  = this.xhr;
			
				xhr.onreadystatechange = function()
				{
					if (xhr.readyState == 4)
					{
						if(xhr.status == 200)
						{
							load[id].data = xhr.responseText.replace(/\r\n/g, "\n");
							load[id].done();
						}
						else if(xhr.status >= 400)
						{
							load[id].error();
						}
					}
				}

			
				xhr.open("GET", this.url, true);
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xhr.send(null);
			break;
		}
	}

var loaded = function()
{
	log('gotta change me');
}

function checkLoad()
{
	var counter = 0;
	var start = loadID.length ? loadID.slice(-1)[0] : 0;

	for(i = start; i < load.length; i++)
		if(load[i].state == 2) counter++;
	
	showLoader(counter / (load.length-start) *100);
	
	if(counter == load.length-start)
		endLoader();
}

function checkFail()
{
	for(i in load)
		if(load[i].state != 2)
			log(i, load[i].type, load[i].url);
}

function clickLoad()
{
	log('load!!');
	for(i in load)
		if(load[i].type == "audio")
			load[i].data.load();
}

function showLoader(percent)
{
	if(!$('progress').length)
	{
		$('<progress/>', {value : 0, max : 100}).appendTo(document.body);
		$('<div/>').appendTo(document.body);
		$('body').bind('click', clickLoad);
	}
	$('progress').attr('value', percent);
}

function endLoader()
{
	$('body').unbind('click', clickLoad);
	$('progress + img').remove();
	$('progress').remove();
	loaded();
}

//////////////////////////////////////////

function loadAll()
{
	loadJS();
	loadSkin();
	loadBeatMap();
	loadReadme();
	
	//loadSound(); → buggy for now (once more)
}

function loadSkin()
{
	var skin_loader = new loader();
	skin_loader.url = Setting.Path.Skin;
	skin_loader.type = "folder";
	skin_loader.extra.param = "full";
	skin_loader.callback = function(array)
	{
		array = array.data;
		
		for(key in array)
		{
			var url = Setting.Path.Skin + array[key].url;
			var basename = array[key].basename;
			
			var new_pic = new loader();
			new_pic.url = url;
			new_pic.extra.basename = basename;
			new_pic.type = "img";
			new_pic.callback = function(array)
			{
				Data.Skin[array.extra.basename] = array.data;
			}
			new_pic.start();
		}
	}
	skin_loader.start();
}

function loadJS()
{
	var js_head = [];
	$('head').find('script').each(function()
	{
		js_head.push(this.getAttribute('src').split('/').slice(-1)[0]);
	});
	
	var js_loader = new loader();
	js_loader.url = "js";
	js_loader.type = "folder";
	js_loader.callback = function(array)
	{
		for(key in array.data)
			if(js_head.indexOf(array.data[key]) == -1)
			{
				var new_js = new loader();
				new_js.url = "js/" + array.data[key];
				new_js.type = "js";
				new_js.extra.filename = array.data[key];
				new_js.callback = function(array)
				{
					switch(array.extra.filename)
					{
						case "translation.js":
							loadTranslation();
							break;
					}
				}
				new_js.start();
			}
	}
	js_loader.start();
}

function loadBeatMap()
{
	//list osz (folders)
	var ls = new loader();
	ls.url = Setting.Path.BeatMap;
	ls.type = "folder";
	ls.extra.param = "full";
	ls.callback = function(array)
	{
		for(i in array.data)
		{
			var id = array.data[i].basename;
			
			//check
			if(Cache && typeof Cache[id] != 'undefined')
			{
				Data.BeatMap[id] = Cache[id];
			}
			else
			{
				//list osu
				var osz = new loader();
				osz.url = array.url + array.data[i].url;
				osz.type = "folder";
				osz.extra.param = 'ext full';
				osz.callback = function(array)
				{
					var osu = array.data.osu;
					for(j in osu)
					{
						//list levels
						var more    = osu[j].basename.replace(/^(.*) \(.*?\).*$/g, "$1").split(' - ', 2);
						
						var id = array.url.replace(/^.+\/([0-9]+)\/.*$/gi, "$1");
						if(typeof Data.BeatMap[id] == 'undefined')
						{
							Data.BeatMap[id] = {};
							Data.BeatMap[id].version = [];
						
							Data.BeatMap[id].artist	= more[0];
							Data.BeatMap[id].creator= osu[j].basename.replace(/^.*\((.*?)\).*$/g, "$1");
							Data.BeatMap[id].title	= more[1];
						}
						
						var version	= osu[j].basename.replace(/^.*\[(.*?)\]$/g, "$1");
						Data.BeatMap[id].version.push(version);
					}
					
					Cache[id] = Data.BeatMap[id];
				}
				osz.start();
			}
		}
	}
	ls.start();
}

function loadReadme()
{
	var bm = new loader();
	bm.url = "readme." + Setting.Lang + ".txt";
	bm.type = "ajax";
	bm.callback = function(array)
	{
		Setting.ReadMe = array.data.replace(/\s*(<\/?h[0-9]+>)\s*/gi, "$1").replace(/\n/gi, "<br />");
	}
	bm.start();
}

function loadSound()
{
	var sd = new loader();
	sd.url = Setting.Path.Sound;
	sd.type = "folder";
	sd.extra.param = 'ext full';
	sd.callback = function(array)
	{
		array = array.data;
		
		for(i in array.mp3)
		{
			var basename = array.mp3[i].basename;
			
			var mp3 = new loader();
			mp3.url = [	Setting.Path.Sound + basename + '.mp3',
					Setting.Path.Sound + basename + '.ogg'];
			mp3.extra.basename = basename;
			mp3.type = "audio";
			mp3.callback = function(array)
			{
				Data.Sound[array.extra.basename] = array.data;
			}
			mp3.start();
		}
	}
	sd.start();
}
