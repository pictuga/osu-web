function BeatMap(id, version)
{
	//id
	this.id		= id;
	this.version	= version;
	this.url	= Setting.Path.BeatMap + this.id + "/" + Data.BeatMap[this.id].artist + " - " + 
		Data.BeatMap[this.id].title + " (" + Data.BeatMap[this.id].creator + ") [" + version + "].osu";
	
	//canvas
	this.canvas;
	this.ctx	// + previous ?
	
	//game values
	this.color
	this.hc		= [];

	this.circleSize
	this.time	= 0;
	this.osu
	this.raw
	this.player
	
	this.requestID;
	
	this.storyboard	= new Storyboard(this);
	
	//size
	this.HH,	this.WW		//total size (including outside the gamefield)(H, W)
	this.H,		this.W		//total percentage (including outside the gamefield)(no ratio)(hp, wp)
	
	this.hh,	this.ww		//gamefield size (+ ratio)(Hr, Wr)
	this.h,		this.w;		//percentage (+ ratio)(h, w)

	this.hs,	this.ws;	//beatmaps coordinates (ratio of course)(MOST USED SO FAR)(thrown to global namespace)
	this.ratio	= false;	//→ ratio has to be changed
	
	//state
	this.ended	= false;
	this.paused	= false;
	
	Game = this;
	Games.push(Game);
	this.load();
}

BeatMap.prototype.load = function()
{
	newLoader();
	loaded = (function(self)
		{
			return	function()
				{
					self.init();
				}
		})(this);
	
	var bm = new loader();
	bm.url = this.url;
	bm.type = "ajax";
	bm.extra.self = this;
	bm.callback = function(array)
	{
		self = array.extra.self;
		
		self.raw  = array.data;
		self.osu = parseOSU(self.raw);
		self.osu.Metadata.id = self.id;
		
		self.storyboard.load();
		
		var mp3 = new loader();
		mp3.url = [	Setting.Path.BeatMap + self.id + "/" + self.osu.General.AudioFilename,
				Setting.Path.Conv + self.id + ".ogg"];
		mp3.type = "audio";
		mp3.extra.self = self;
		mp3.callback = function(array)
		{
			array.extra.self.player = array.data;
		}
		mp3.start();
		
		//iOS stuff to include to make sure mp3s are loaded
	}
	bm.start();
}

BeatMap.prototype.init = function()
{
	if(this.osu.General.EpilepsyWarning)
		window.alert(µ.EP_WARN)
	
	//canvas
		if(!$('canvas').length)
			$('<canvas/>').appendTo(document.body);
		
		this.canvas = $('canvas').get(0);
		
		if(!this.canvas.getContext) return false;
		this.ctx = this.canvas.getContext("2d");
	
	//color
		//orange green blue red
		this.color =
		[
			[255,	165,	0],
			[0,	255,	0],
			[0,	0,	255],
			[255,	0,	0]
		];
		
		var i = 0;
		for(key in this.osu.Colours)
		{
			this.color[i] = this.osu.Colours[key];
			i++;
		}
	
	//creates an array with all the hitObjects
		var comboKey = 1;	//numéro DANS le combo
		var combo = 0;		//numéro DU combo (sur tous)
		
		var prev = false;
		for(key in this.osu.HitObjects)
		{
			var hc = new hitCircle(key, prev, this.osu.HitObjects[key]);
			
			if(hc.type == 4 || hc.type == 5 || hc.type == 6)
			{
				//new combo
				if(key != 0) combo++;//solves issue if 1st hitObject

				hc.comboKey = 1;
				hc.combo = combo;

				comboKey = 2;
			}
			else
			{
				hc.comboKey = comboKey;
				hc.combo = combo;
				comboKey++;
			}
			
			this.hc.push(hc);
			prev = hc;
		}
	
	//values (circleSize...)
		this.circleSize = 64 * (1 - 0.7*((this.osu.Difficulty.CircleSize-5)/5)) / 2;
	
	//start the game
		this.storyboard.init();
		this.resize();
		
		this.player.currentTime = 0;
		this.play();
}

BeatMap.prototype.play = function()
{
	if(this.ended) return;

	//status
		this.paused = false;
		this.ended = false;
	
	//events
		//reset
			$(this.canvas).unbind();
			$(window).unbind();
		//apply
			$(this.canvas).bind('mousedown',	function(e){Game.checkHit(e)});
			$(this.canvas).bind('mouseup',		function(){Game.unbind()});
	
			$(this.canvas).bind('touchstart',	function(e){Game.checkHit(e)});
			$(this.canvas).bind('touchend',		function(){Game.unbind()});
	
			$(window).keydown(function(e){Game.checkKey(e)});
			$(window).resize(function(){Game.resize()});
			$(window).blur(function(){Game.pause()});
	
			$(this.canvas).bind('contextmenu', prevent);
			$(window).bind('touchmove', prevent);
	
	//start
		this.player.play();
		this.autoUpdate();
}

BeatMap.prototype.pause = function()
{
	if(this.paused) return;
	
	cancelAnimationFrame(this.requestID);
	this.paused = true;
	this.player.pause();
	$(this.canvas).unbind();
	menu();
}

BeatMap.prototype.end = function()
{
	if(this.ended) return;
	
	//stop
		cancelAnimationFrame(this.requestID);
		this.player.pause();
	//state
		this.paused	= true;
		this.ended	= true;
	//unbind
		$(this.canvas).unbind();
		$(window).unbind();
	//remove DOM stuff
		$(this.canvas).remove();
	//go on
		pickBeatMap();
}

BeatMap.prototype.playPause = function()
{
	if(this.paused)	this.play();
	else		this.pause();
}

BeatMap.prototype.unbind = function()//FIXME remove?
{
	$(this.canvas).unbind('.slide');
}

function prevent(event)//FIXME required ?
{
	event.preventDefault();
	return false;
}

BeatMap.prototype.autoUpdate = function()
{
	if(this.paused) return;
	
	if(this.player.ended)
	{
		this.end();
		return;
	}
	
	this.requestID = requestAnimationFrame((function(self)
		{
			return	function()
				{
					self.autoUpdate();
				}
		})(this));
	this.update();
}

var tps = 0;
var time, ctx, w, h, circleSize;
BeatMap.prototype.update = function()
{
	//double buffer
	
	var oldCtx = this.ctx;
	this.ctx = $('<canvas/>').attr({width: this.WW, height: this.HH}).get(0).getContext('2d');
	
	//actual update
	
	this.ctx.clear();
	if(this.paused) return;
	
	this.time = this.player.currentTime * 1000;
	
	if(this.ratio)
	{
		this.ctx.save();
		
		diff_height = 0;
		diff_width = 0;
		
		if(4*this.HH < 3*this.WW)
			diff_width  = this.WW/2 - (4/3 * this.HH)/2;
		else if(4*this.HH > 3*this.WW)
			diff_height = this.HH/2 - (3/4 * this.WW)/2;
		
		this.ctx.translate(diff_width, diff_height);
	}
	
	ctx	= this.ctx;
	w	= this.ws;
	h	= this.hs;
	time	= this.time;
	circleSize = this.circleSize;
	
	for(key in this.hc)
		this.hc[key].draw();
	
	this.storyboard.draw();
	
	if(this.ratio) this.ctx.restore();
	
	this.drawProgress();
	this.drawScore();
	
	this.drawInfo('FPS ⋅ ' + Math.floor(1000 / Math.abs(new Date().getMilliseconds() - tps)));
	tps = new Date().getMilliseconds();
	
	//swap buffers
	
	oldCtx.clear();
	oldCtx.drawImage(this.ctx.canvas, 0, 0);
	this.ctx = oldCtx;
}

BeatMap.prototype.checkHit = function(e)
{
	var click_time = this.time;
	
	if(e.type == 'touchstart' && e.originalEvent.touches.length == 1)
	{
		$(this.canvas).unbind('mousedown');
		
		var mouseX = e.originalEvent.touches[0].clientX;
		var mouseY = e.originalEvent.touches[0].clientY;
	}
	else
	{
		var mouseX = e.clientX;
		var mouseY = e.clientY;
	}
	
	if(this.ratio)
	{
		if(4*this.HH < 3*this.WW)
			mouseX -= (this.WW - (4/3 * this.HH))/2;
		else if(4*this.HH > 3*this.WW)
			mouseY -= (this.HH - (3/4 * this.WW))/2;
	}
	
	mouseX = mouseX / this.ws;
	mouseY = mouseY / this.hs;
	
	loop:
	for(key in this.hc)
		switch(this.hc[key].Type)
		{
			case "circle":
				if(isIn(click_time, this.hc[key].time-1500, this.hc[key].time+100) && !this.hc[key].clic)
					if(this.hc[key].checkHit(mouseX, mouseY))
						break loop;
			break;
		
			case "slider":
				if(isIn(this.time, this.hc[key].time-1500, this.hc[key].endTime) && this.hc[key].checkSlide(mouseX, mouseY))
				{
					$(this.canvas).bind('mousemove.slide', function(e){Game.checkSlide(e)});
					$(this.canvas).bind('touchmove.slide', function(e){Game.checkSlide(e)});
					break loop;
				}
			break;
		
			case "spinner":
				if(isIn(this.time, this.hc[key].time, this.hc[key].endTime))
				{
					$(this.canvas).bind('mousemove.slide', function(e){Game.checkSpin(e)});
					$(this.canvas).bind('touchmove.slide', function(e){Game.checkSpin(e)});
					this.hc[key].checkSpin(mouseX, mouseY);
					break loop;
				}
			break;
		}
	
	e.preventDefault();
}

BeatMap.prototype.checkSlide = function(e)
{
	if(e.type == 'touchmove' && e.originalEvent.touches.length == 1)
	{
		var mouseX = e.originalEvent.touches[0].clientX;
		var mouseY = e.originalEvent.touches[0].clientY;
	}
	else
	{
		var mouseX = e.clientX;
		var mouseY = e.clientY;
	}
	
	if(this.ratio)
	{
		if(4*this.HH < 3*this.WW)
			mouseX -= (this.WW - (4/3 * this.HH))/2;
		else if(4*this.HH > 3*this.WW)
			mouseY -= (this.HH - (3/4 * this.WW))/2;
	}
	
	mouseX = mouseX / this.ws;
	mouseY = mouseY / this.hs;
	
	for(key in this.hc)
		if(this.hc[key].Type == "slider")
		{
			if(!this.hc[key].slidePoints.length || distancePoints(this.hc[key].slidePoints.slice(-1)[0], [mouseX, mouseY]) > 3)
				if(this.hc[key].checkSlide(mouseX, mouseY))
				{
					this.hc[key].slidePoints.push([mouseX, mouseY]);
					break;
				}
		}
	
	e.preventDefault();
}

BeatMap.prototype.checkSpin = function(e)
{
	if(e.type == 'touchmove' && e.originalEvent.touches.length == 1)
	{
		var mouseX = e.originalEvent.touches[0].clientX;
		var mouseY = e.originalEvent.touches[0].clientY;
	}
	else
	{
		var mouseX = e.clientX;
		var mouseY = e.clientY;
	}
	
	if(this.ratio)
	{
		if(4*this.HH < 3*this.WW)
			mouseX -= (this.WW - (4/3 * this.HH))/2;
		else if(4*this.HH > 3*this.WW)
			mouseY -= (this.HH - (3/4 * this.WW))/2;
	}
	
	mouseX = mouseX / this.ws;
	mouseY = mouseY / this.hs;
	
	for(key in this.hc)
		if(this.hc[key].Type == "spinner" && isIn(this.time, this.hc[key].time, this.hc[key].endTime))
		{
			this.hc[key].checkSpin(mouseX, mouseY);
			break;
		}
	
	e.preventDefault();
}

BeatMap.prototype.sumPoints = function(type)
{
	var sum = 0;
	for(key in this.hc)
	{
		if(!type) sum += this.hc[key].score;
		else if (this.hc[key].score == type) sum ++;
	}
	
	return sum;
}

BeatMap.prototype.drawProgress = function()
{
	if(isNaN(this.player.duration) || this.player.duration == 0) return false;
	
	var size = 4;
	var dl = (typeof this.player.buffered == 'object') ? (this.player.buffered.end(0) / this.player.duration) : 1;
	var taux = (this.player.currentTime / this.player.duration);
	
	var center = {x: (this.WW-this.h*(size+2)), y:(this.h*(size+2))};
	var radius = this.h*size;
	
	//param
	this.ctx.save();
	this.ctx.globalCompositeOperation = "source-over";

	//reset
	this.ctx.lineWidth = 1;
	this.ctx.lineCap = "butt";

	//background (dl)
	this.ctx.beginPath();
		this.ctx.fillStyle = "rgb(225,225,225)";
		this.ctx.arc(center.x, center.y, radius, (-Math.PI/2), (Math.PI*2*dl)-(Math.PI/2), 0);
		this.ctx.lineTo(center.x, center.y);
		this.ctx.closePath();
	this.ctx.fill();
	
	//camembert (taux)
	this.ctx.beginPath();
		this.ctx.fillStyle = "rgb(200,200,200)";
		this.ctx.arc(center.x, center.y, radius, (-Math.PI/2), (Math.PI*2*taux)-(Math.PI/2), 0);
		this.ctx.lineTo(center.x, center.y);
		this.ctx.closePath();
	this.ctx.fill();
	
	//breaks
	for(i in this.osu.Events)
	{
		if(this.osu.Events[i][0] != 2) continue;
		
		var start	= this.osu.Events[i][1]/1000 / this.player.duration;
		var end		= this.osu.Events[i][2]/1000 / this.player.duration;
		
		this.ctx.beginPath();
			this.ctx.strokeStyle = "rgba(0,0,0,0.75)";
			this.ctx.lineWidth = 1;
			this.ctx.arc(center.x, center.y, radius, (Math.PI*2*start)-(Math.PI/2), (Math.PI*2*end)-(Math.PI/2), 0);
		this.ctx.stroke();
	}
	
	this.ctx.restore();
}

BeatMap.prototype.drawScore = function()
{
	this.ctx.save();
	
	var points = this.sumPoints();
	var size = 4;
	
	this.ctx.globalCompositeOperation = "source-over";
			
	this.ctx.textAlign = "left";
	this.ctx.textBaseline = "top";

	this.ctx.font = this.h*size + "px Arial";
	this.ctx.fillStyle = "Black";
	
	this.ctx.shadowBlur = 2*this.h;
	this.ctx.shadowColor = "white";

	if(points < 2)	this.ctx.fillText(points + " " + µ.BM_1PT, (2*this.h), (2*this.h));
	else		this.ctx.fillText(points + " " + µ.BM_2PT, (2*this.h), (2*this.h));
	
	this.ctx.restore();
}

BeatMap.prototype.drawInfo = function(txt)
{
	this.ctx.save();
	this.ctx.globalCompositeOperation = "source-over";
	
	var size = 2;
		
	this.ctx.textAlign = "left";
	this.ctx.textBaseline = "bottom";

	this.ctx.font = this.H*size + "px Arial";
	this.ctx.fillStyle = "Black";

	this.ctx.fillText(txt, (2*this.H), (this.HH-2*this.H));
	
	this.ctx.restore();
}

BeatMap.prototype.resize = function()
{
	this.WW = window.innerWidth;
	this.HH = window.innerHeight;
	
	this.W = (this.WW/100);
	this.H = (this.HH/100);
	
	this.ws = (this.WW/512); //512
	this.hs = (this.HH/384); //384
	// 512÷384 = 800÷600 = 4÷3
	
	this.hh = this.HH;
	this.ww = this.WW;
	
	this.h = this.H;
	this.w = this.W;
	
	if(4*this.HH < 3*this.WW)
	{
		this.ws = (4/3 * this.HH) / 512;
		this.ww = (4/3 * this.HH);
		
		this.w = (4/3 * this.H);
		this.ratio = true;
	}
	else if(4*this.HH > 3*this.WW)
	{
		this.hs = (3/4 * this.WW) / 384;
		this.hh = (3/4 * this.WW);
		
		this.h = (3/4 * this.W);
		this.ratio = true;
	}
	else	this.ratio = false;
	
	$(this.canvas).attr("width",	this.WW);
	$(this.canvas).attr("height",	this.HH);
	
	this.pause();
}

BeatMap.prototype.checkKey = function(e)
{
	if (e == null) e = window.event;
	
	var keyCode  = (window.event) ? event.keyCode : e.keyCode;
	var key = String.fromCharCode(keyCode).toLowerCase();
	
	log('key hit', key, keyCode);
	
	switch(keyCode)
	{
		case 27:
			this.playPause();
			break;
	}
}
