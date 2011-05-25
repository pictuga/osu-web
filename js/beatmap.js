var canvas, ctx;
var color;

var circleSize, beatLength, sliderSpeed, time = 0;
var timer = false;


var hc = [];//filled with initBeatMap()

function initBeatMap()
{
	if(osu_file.General.EpilepsyWarning == 1 && !window.confirm("This beatmap contains scenes with rapidly flashing colours.\nPlease take caution if you are affected by epilepsy.\n\tCancel → Pick another beatmap"))
	{
		pickBeatMap();
		return false;
	}
	
	//<canvas>
		if(!document.getElementById("canvas"))
		{
			canvas = document.createElement("canvas");
			canvas.id = "canvas";
			body.appendChild(canvas);
		}
		canvas = document.getElementById("canvas");
		
		if(!canvas.getContext) return false;
		ctx = canvas.getContext("2d");
	
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
		canvas.onmousedown = checkHit;
		canvas.onmouseup = function() { window.onmousemove = null; }
		canvas.oncontextmenu = function(){ return false; }
		window.onkeydown = checkKey;
	
		window.onresize = function(){resizeBeatMap()};
		body.ontouchmove = function (e) { e.preventDefault(); }
	
		//auto pause
		window.onblur = function(){ pause(); }
	
	//addons
		runAddons("initBeatMap");
	
	//start the game
		initStoryBoard();
		resizeBeatMap();
		
		player.play();
		
		if(!timer) autoUpdateBeatMap();
}

function autoUpdateBeatMap()
{
	timer = true;
	updateBeatMap();
	
	if(!player.ended)
	{
		setTimeout(
			function()
			{
				try//solves some issues // ugly workaround I know
				{
					setTimeout("autoUpdateBeatMap();", 0);
				}
				catch(e)
				{
					log('updateBeatMap failure', e);
				}
			}
		, 0);
	}
	else
	{
		timer = false;
		alert('End - Press "C" to pick another beatmap !');
		runAddons("end");
	}
}

var tps = 0;

function updateBeatMap()
{
	ctx.clear();
	
	if(!player.ended)
	{
		//addons
		runAddons("updateBeatMap");
		
		updateValues();
		
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
	else
	{
		drawStat();
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
		if(isIn(click_time, hc[key].time-1500, hc[key].time+100) && !hc[key].clic && (hc[key].type == 1 || hc[key].type == 4 || hc[key].type == 5))//hitcircle
		{
			if(hc[key].checkHit(mouseX, mouseY)) break;
		}
		
		if(hc[key].type == 2 || hc[key].type == 6)//slider
		{
			var t = hc[key].sliderCount * ( hc[key].sliderLength / sliderSpeed );//time with repeat
			
			if(isIn(time, hc[key].time-1500, hc[key].time+t))
			{
				if(hc[key].checkSlide(mouseX, mouseY))
				{
					window.onmousemove = checkSlide;
					break;
				}
			}
		}
		
		if(isIn(time, hc[key].time, hc[key].endTime) && (hc[key].type == 8 || hc[key].type == 12))//spinner
		{
			window.onmousemove = checkSpin;
			hc[key].checkSpin(mouseX, mouseY);
			break;
		}
	}
	
	//désactiver le clic
	return false;
}

function checkSlide(e)
{
	var slide_time = time;
	
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
		if(hc[key].type == 2 || hc[key].type == 6)
		{
			if(hc[key].checkSlide(mouseX, mouseY))
			{
				hc[key].slidePoints.push([mouseX, mouseY]);
				break;
			}
		}
	}
	
	//disables click
	return false;
}

function checkSpin(e)
{
	var spin_time = time;
	
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
		if(isIn(time, hc[key].time, hc[key].endTime) && (hc[key].type == 8 || hc[key].type == 12))
		{
			hc[key].checkSpin(mouseX, mouseY);
			break;
		}
	}
	
	//disables click
	return false;
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
	var points = sumPoints();
	var size = 4;
	
	ctx.globalCompositeOperation = "source-over";
			
	ctx.textAlign = "left";
	ctx.textBaseline = "top";

	ctx.font = h*size + "px Arial";
	ctx.fillStyle = "Black";

	if(points < 2) ctx.fillText(points + " Point", (2*h), (2*h));
	else ctx.fillText(points + " Points", (2*h), (2*h));
}

function drawStat()
{
	//outline
		ctx.beginPath();
			ctx.strokeStyle = "Black";
			ctx.rect((wp*25), (hp*10), (wp*50), (hp*80));
			ctx.moveTo((wp*25+(0.1*wp*75)), (hp*10));
			ctx.rect((wp*25+(0.1*wp*50)), (hp*10), (wp*40), (hp*16));
		ctx.stroke();
	
	//txt
		var size = 4;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
	
		ctx.font = hp*size + "px Arial";
		ctx.fillStyle = "Black";

		//score
		ctx.font = (hp*16*0.75) + "px Arial";
		ctx.fillText(sumPoints(), (W/2), (18*hp));
		
		//50
		ctx.font = (hp*16*0.75) + "px Arial";
		ctx.fillText(sumPoints(50) + " × 50", (37.5*wp), (48*hp));//100(50÷100)(100÷400)+25
		
		//100
		ctx.font = (hp*16*0.75) + "px Arial";
		ctx.fillText(sumPoints(100) + " × 100", (62.5*wp), (48*hp));
		
		//300
		ctx.font = (hp*16*0.75) + "px Arial";
		ctx.fillText(sumPoints(300) + " × 300", (W/2), (69*hp));//100(80÷100)(2×80÷300)+26
}

function drawInfo(txt)
{
	var points = sumPoints();
	var size = 2;

	ctx.globalCompositeOperation = "source-over";
		
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";

	ctx.font = h*size + "px Arial";
	ctx.fillStyle = "Black";

	ctx.fillText(txt, (2*h), (H-2*h));
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
	
	canvas.setAttribute("width", W);
	canvas.setAttribute("height", H);
	
	//addons
	updateBeatMap();
	runAddons("resizeBeatMap");
}

function updateValues()
{
	time = player.currentTime * 1000;
	
	//beatLength inherited only once (cannot inherit from inherited values)
	//beatLength in ms
	
	var i, li = 0;//latest_i = li
	
	for(i in osu_file.TimingPoints)
	{
		if(time > osu_file.TimingPoints[i][0])//too late
		{
			i = (i == 0) ? 0 : i-1;
			break;
		}
		else if(osu_file.TimingPoints[i][1] > 0)//if not inherited
		{
			li = i;
		}
	}
	
	if(osu_file.TimingPoints[i][1] < 0)
	{
		//inherited
		speed = osu_file.Difficulty.SliderMultiplier * ( 100 / osu_file.TimingPoints[li][1] );
		
		beatLength = osu_file.TimingPoints[i][1] / -100 * osu_file.TimingPoints[li][1];
		sliderSpeed = -100 * speed / osu_file.TimingPoints[i][1];
	}
	else
	{
		beatLength = osu_file.TimingPoints[i][1];
		sliderSpeed = osu_file.Difficulty.SliderMultiplier * ( 100 / beatLength );
	}
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
