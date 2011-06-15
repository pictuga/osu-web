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
		//check that the file isn't already loaded !
		for(var i in load)
		{
			if(load[i].url == this.url)
			{
				//
			}
		}
		
		//if not, ddl it
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
							load[id].data = xhr.responseText;
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
	for(i in load)
	{
		if(load[i].state == 2) counter++;
	}
	
	showLoader(counter/load.length*100);
	
	if(counter == load.length)
	{
		$('#loader').remove();
		loaded();
	}
}

function checkFail()
{
	for(i in load)
	{
		if(load[i].state != 2) log(i, load[i].type, load[i].url);
	}
}

function showLoader(progress)
{
	if(!$('#loader').size())
		$('<div id="loader"/>')
		.append( $('<div/>').append('<input type="button"/>') )
		.appendTo(document.body);
	
	$('#loader div').css('width', progress + "%");
	$('#loader input').val(Math.ceil(progress) + "%");
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
	pic_loader.url = "image";
	pic_loader.type = "folder";
	pic_loader.extra.param = "full";
	pic_loader.callback = function(array)
	{
		array = array.data;
		
		for(key in array)
		{
			var url = "image/" + array[key].url;
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
	var js_array = ['beatmap', 'hitcircle', 'addons', 'slider', 'spinner', 'picker', 'sb', 'menu', 'curves', 'settings', 'translation', 'sort'];
	
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
				case "translation":
					loadTranslation();
					break;
			}
		}
		new_js.start();
	}
}

var beatmap = {};

function loadBeatMap()
{
	//list osz (folders)
	var ls = new loader();
	ls.url = BEATMAP;
	ls.type = "folder";
	ls.extra.param = "full";
	ls.callback = function(array)
	{
		for(i in array.data)
		{
			if(array.data[i].url == "conv/") continue;
			
			//check
			var id = array.data[i].basename;
			
			//list osu
			var osz = new loader();
			osz.url = array.url + array.data[i].url;
			osz.type = "folder";
			osz.extra.param = 'ext full';
			osz.callback = function(array)
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
					//list levels
					var id = array.url.replace(/^.+\/([0-9]+)\/.*$/gi, "$1");
					if(typeof beatmap[id] == 'undefined')
					{
						beatmap[id] = {};
						beatmap[id].version = [];
					}
					
					var more    = osu[j].basename.replace(/^(.*) \(.*?\).*$/g, "$1").split(' - ', 2);
					
					beatmap[id].artist	= more[0];
					beatmap[id].title	= more[1];
					var version		= osu[j].basename.replace(/^.*\[(.*?)\]$/g, "$1");
					beatmap[id].creator	= osu[j].basename.replace(/^.*\((.*?)\).*$/g, "$1");
					
					beatmap[id].version.push(version);
				}
			}
			osz.start();
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
		$('<div/>', {id: "pdiv", html: readme})
			.append
			(
				$('<div class="adsense"/>')
				.append
				(
					$('#adsense iframe')
					.clone()
				)
			)
			.insertBefore('#loader');
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
