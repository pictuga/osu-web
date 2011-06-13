var canvas, ctx, color, hc;
var circleSize, time = 0, fps = 50;
var osu_file, osu_raw, osu_id, player;

function initBeatMap()
{
	//init
		osu_file = parseOSU(osu_raw);
		osu_file.Metadata.id = osu_id;
	
	if(osu_file.General.EpilepsyWarning == 1 && !window.confirm(_('EP_WARN')))
	{
		pickBeatMap();
		return false;
	}
	
	//reset
		hc = [];
	
	//<canvas>
		if(!$('#canvas').size())
			$('<canvas id="canvas"/>').appendTo(document.body);
		
		canvas = $('#canvas');
		if(!canvas.get(0).getContext) return false;
		ctx = canvas.get(0).getContext("2d");
	
	//couleurs
		//orange green blue red
		color =
		[
			[255,	165,	0],
			[0,	255,	0],
			[0,	0,	255],
			[255,	0,	0]
		];
		
		var i = 0;
		for(key in osu_file.Colours)
		{
			color[i] = osu_file.Colours[key];
			i++;
		}
	
	//creates an array with all the hitObjects
		var comboKey = 1;	//numéro DANS le combo
		var combo = 0;		//numéro DU combo (sur tous)
	
		for(key in osu_file.HitObjects)
		{
			var new_hc = new hitCircle(key, osu_file.HitObjects[key]);
			
			if(new_hc.type == 4 || new_hc.type == 5 || new_hc.type == 6)
			{
				//new combo
				if(key != 0) combo++;//solves issue if 1st hitObject

				new_hc.comboKey = 1;
				new_hc.combo = combo;

				comboKey = 2;
			}
			else
			{
				new_hc.comboKey = comboKey;
				new_hc.combo = combo;
				comboKey++;
			}
			
			hc.push(new_hc);
		}
	
	//values (circleSize...)
		circleSize = 64 * (1 - 0.7*((osu_file.Difficulty.CircleSize-5)/5)) / 2;
		//beatLength & sliderSpeed → updateValues()
	
	//events
		//reset
			canvas.unbind();
			$(window).unbind();
			$(document.body).unbind();
			$(player).unbind();
		
		//new
			canvas.mousedown(checkHit);
			canvas.mouseup(function() { window.onmousemove = null; });
			canvas.bind('oncontextmenu', function(e){ e.preventDefault(); });
		
			$(window).keydown(checkKey);
			$(window).resize(resizeBeatMap);
			$(window).blur(pause);
		
			$(document.body).bind('ontouchmove', function (e) { e.preventDefault(); });
			
			$(player).bind('playing', autoUpdateBeatMap);
	
	//addons
		runAddons("initBeatMap");
	
	//start the game
		initStoryBoard();
		resizeBeatMap();
		
		player.currentTime = 0;
		player.play();
}

var ON = false;
function autoUpdateBeatMap()
{
	updateBeatMap();
	if(!ON)
	{
		ON = true;
		keepUpdateBeatMap();
	}
}

function keepUpdateBeatMap()
{
	if(player.ended || player.paused)
	{
		log('ended');
		ctx.clear();
		if(player.ended)
		{
			pickBeatMap();
		}
		else	pause();
		
		ON = false;
		return;
	}
	else
	{
		updateBeatMap();
		setTimeout(keepUpdateBeatMap, 1000/fps);
	}
}

var tps = 0;

function updateBeatMap()
{
	ctx.clear();
	
	if(!player.ended)
	{
		//addons
		time = player.currentTime * 1000;
		runAddons("updateBeatMap");
		
		if(ratio)
		{
			ctx.save();
			
			diff_height = 0;
			diff_width = 0;
			
			if(4*H < 3*W)
				diff_width = W/2 - (4/3 * H)/2;
			else if(4*H > 3*W)
				diff_height = H/2 - (3/4 * W)/2;
			
			ctx.translate(diff_width, diff_height);
		}
		
		for(key in hc)
			hc[key].draw();//← decides what to do
		
		drawStoryBoard();
		
		if(ratio) ctx.restore();
		
		drawProgress();
		drawScore();
		//drawTest();
		
		drawInfo('FPS ⋅ ' + Math.floor(1000 / Math.abs(new Date().getMilliseconds() - tps)));
		tps = new Date().getMilliseconds();
	}
}

function checkHit(e)
{
	var click_time = time;
	
	if (e == null) e = window.event;
		
	var mouseX = e.clientX;
	var mouseY = e.clientY;
	
	if(ratio)
	{
		if(4*H < 3*W)
			mouseX -= (W - (4/3 * H))/2;
		else if(4*H > 3*W)
			mouseY -= (H - (3/4 * W))/2;
	}
	
	mouseX = mouseX / ws;
	mouseY = mouseY / hs;
	
	for(key in hc)
	{
		if(hc[key].Type == "circle" && isIn(click_time, hc[key].time-1500, hc[key].time+100) && !hc[key].clic)//hitcircle
		{
			if(hc[key].checkHit(mouseX, mouseY)) break;
		}
		
		if(hc[key].Type == "slider" && isIn(time, hc[key].time-1500, hc[key].endTime) && hc[key].checkSlide(mouseX, mouseY))
		{
			window.onmousemove = checkSlide;
			break;
		}
		
		if(hc[key].Type == "spinner" && isIn(time, hc[key].time, hc[key].endTime))//spinner
		{
			window.onmousemove = checkSpin;
			hc[key].checkSpin(mouseX, mouseY);
			break;
		}
	}
	
	//désactiver le clic
	e.preventDefault();
}

function checkSlide(e)
{
	if (e == null) e = window.event;
		
	var mouseX = e.clientX;
	var mouseY = e.clientY;
	
	if(ratio)
	{
		if(4*H < 3*W)
			mouseX -= (W - (4/3 * H))/2;
		else if(4*H > 3*W)
			mouseY -= (H - (3/4 * W))/2;
	}
	
	mouseX = mouseX / ws;
	mouseY = mouseY / hs;
	
	for(key in hc)
	{
		if(hc[key].Type == "slider" && hc[key].checkSlide(mouseX, mouseY))
		{
			hc[key].slidePoints.push([mouseX, mouseY]);
			break;
		}
	}
	
	//disables click
	e.preventDefault();
}

function checkSpin(e)
{
	if (e == null) e = window.event;
		
	var mouseX = e.clientX;
	var mouseY = e.clientY;
	
	if(ratio)
	{
		if(4*H < 3*W)
			mouseX -= (W - (4/3 * H))/2;
		else if(4*H > 3*W)
			mouseY -= (H - (3/4 * W))/2;
	}
	
	mouseX = mouseX / ws;
	mouseY = mouseY / hs;
	
	for(key in hc)
	{
		if(hc[key].Type == "spinner" && isIn(time, hc[key].time, hc[key].endTime))
		{
			hc[key].checkSpin(mouseX, mouseY);
			break;
		}
	}
	
	//disables click
	e.preventDefault();
}

function sumPoints(type)
{
	var sum = 0;
	for(key in hc)
	{
		if(!type) sum += hc[key].score;
		else if (hc[key].score == type) sum ++;
	}
	
	return sum;
}

function drawProgress()
{
	//draws a "camembert" with progress
	if(!isNaN(player.duration) && player.duration != 0)
	{
		var size = 4;
		var dl = (typeof player.buffered == 'object') ? (player.buffered.end(0) / player.duration) : 1;
		var taux = (player.currentTime / player.duration);
	
		//param
		ctx.globalCompositeOperation = "source-over";
	
		//reset
		ctx.lineWidth = 1;
		ctx.lineCap = "butt";
	
		//background (dl)
		ctx.beginPath();
			ctx.fillStyle = "rgb(225,225,225)";
			ctx.arc((W-h*(size+2)), (h*(size+2)), (h*size), (-Math.PI/2), (Math.PI*2*dl)-(Math.PI/2), 0);
			ctx.lineTo((W-h*(size+2)), (h*(size+2)));
			ctx.closePath();
		ctx.fill();
		
		//camembert (taux)
		ctx.beginPath();
			ctx.fillStyle = "rgb(200,200,200)";
			ctx.arc((W-h*(size+2)), (h*(size+2)), (h*size), (-Math.PI/2), (Math.PI*2*taux)-(Math.PI/2), 0);
			ctx.lineTo((W-h*(size+2)), (h*(size+2)));
			ctx.closePath();
		ctx.fill();
	}
}

function drawTest()
{
	var taux = (time % 1000)/10;
	ctx.fillStyle = "blue";
	ctx.fillRect(0, 0, 2.5*wp, taux*hp);
	
	var taux = (new Date().getMilliseconds() % 1000)/10;
	ctx.fillStyle = "blue";
	ctx.fillRect(2.5*wp, 0, 2.5*wp, taux*hp);
}

function drawScore()
{
	ctx.save();
	
	var points = sumPoints();
	var size = 4;
	
	ctx.globalCompositeOperation = "source-over";
			
	ctx.textAlign = "left";
	ctx.textBaseline = "top";

	ctx.font = h*size + "px Arial";
	ctx.fillStyle = "Black";
	
	ctx.shadowBlur = 2*h;
	ctx.shadowColor = "rgba(255, 255, 255, 0.75)";

	if(points < 2) ctx.fillText(points + " " + _('BM_1PT'), (2*h), (2*h));
	else ctx.fillText(points + " " + _('BM_2PT'), (2*h), (2*h));
	
	ctx.restore();
}

function drawInfo(txt)
{
	ctx.save();
	
	var points = sumPoints();
	var size = 2;

	ctx.globalCompositeOperation = "source-over";
		
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";

	ctx.font = h*size + "px Arial";
	ctx.fillStyle = "Black";

	ctx.fillText(txt, (2*h), (H-2*h));
	
	ctx.restore();
}

var H, W;	//total size (including outside the gamefield)
var hp, wp;	//total percentage (including outside the gamefield)(no ratio)

var Hr, Wr;	//gamefield size (+ ratio)
var h, w;	//percentage (+ ratio)

var hs, ws;	//beatmaps coordinates (ratio of course)(MOST USED SO FAR)
var ratio = false;//→ ratio has to be changed

function resizeBeatMap(e)
{
	W = window.innerWidth;
	H = window.innerHeight;
	
	wp = (W/100);
	hp = (H/100);
	
	ws = (W/512); //512
	hs = (H/384); //384
	// 512÷384 = 800÷600 = 4÷3
	
	Hr = H;
	Wr = W;
	
	h = hp;
	w = wp;
	
	if(4*H < 3*W)
	{
		ws = (4/3 * H) / 512;
		Wr = (4/3 * H);
		
		w = (4/3 * hp);
		ratio = true;
	}
	else if(4*H > 3*W)
	{
		hs = (3/4 * W) / 384;
		Hr = (3/4 * W);
		
		h = (3/4 * wp);
		ratio = true;
	}
	else	ratio = false;
	
	canvas.attr("width", W);
	canvas.attr("height", H);
	
	//addons
	updateBeatMap();
	runAddons("resizeBeatMap");
}

function checkKey(e)
{
	if (e == null) e = window.event;
	
	var keyCode  = (window.event) ? event.keyCode : e.keyCode;
	var key = String.fromCharCode(keyCode).toLowerCase();
	
	log('key hit', key, keyCode);
	
	switch(key)
	{
		case "q":
			removejWindow();
			break;
		case "i":
			var txt = "";
			for(key in pic)
			{
				txt += "<img src='/images/" + key + ".png' title='" + key + "' />";
			}
			alert(txt);
			break;
	}
	
	switch(keyCode)
	{
		case 27:
			pause();
			break;
	}
	
	for(i in addons)
	{
		if(addons[i].ActivationKey == key)
		{
			if(addons[i].Running == true)
			{
				addons[i].Running = false;
				if(isFunction(addons[i].Functions["switchOff"])) addons[i].Functions["switchOff"]();
			}
			else
			{
				addons[i].Running = true;
				if(isFunction(addons[i].Functions["switchOn"])) addons[i].Functions["switchOn"]();
			}
			if(isFunction(addons[i].Functions["switchOnOff"])) addons[i].Functions["switchOnOff"]();
		}
	}
}
