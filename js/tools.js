function log()
{
	if(window.console)
		console.log(arguments.length == 1 ? arguments[0] : arguments);
}

function newLine(str)
{
	return str.replace(/\r\n/g, "\n");
}

function isIn(value, start, end)
{
	return (value >= Math.min(start, end) && value <= Math.max(end));
}

CanvasRenderingContext2D.prototype.clear = function()
{
	this.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

CanvasRenderingContext2D.prototype.circle = function(x, y, radius)
{
	this.arc(x, y, radius, 0, Math.PI*2, 0);
}

CanvasRenderingContext2D.prototype.drawImageAngle = function(image, x, y, angle, coeff)
{
	if(typeof coeff != 'undefined' && coeff != 1)
	{
		var width = image.width * coeff;
		var height = image.height * coeff;
	}
	else
	{
		coeff = 1;
		var width = image.width;
		var height = image.height;
	}
	
	if(typeof angle != 'undefined' && mainMesure(angle) != 0)
	{
		this.save();
		
		this.translate(x, y);
		this.rotate(angle);
		
		if(coeff != 1)	this.drawImage(image, -width/2, -height/2, width, height);
		else		this.drawImage(image, -width/2, -height/2);
		
		this.restore();
	}
	else
	{
		if(coeff != 1)	this.drawImage(image, (x - width/2), (y - height/2), width, height);
		else		this.drawImage(image, (x - width/2), (y - height/2));
	}
}

CanvasRenderingContext2D.prototype.drawImageScaled = function(image, x, y, angle)
{
	var height = image.height * Game.circleSize*Game.hs*2 / Data.Skin["sliderb0"].height
	var coeff = height / image.height;
	
	if(typeof angle == 'undefined') angle = 0;
	this.drawImageAngle(image, x, y, angle, coeff);
}

function StoreObject(key, value)
{
	if(!localStorage) return false;
	localStorage.setItem(key, JSON.stringify(value));
}

function UnStoreObject(key)
{
	if(!localStorage) return {};
	var out = JSON.parse(localStorage.getItem(key));
	return (out != null) ? out : {};
}

(function ()
{
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x)
	{
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element)
	{
		var currTime = new Date().getTime();
		var timeToCall = Math.max(0, 16 - (currTime - lastTime));
		var id = window.setTimeout(function ()
		{
			callback(currTime + timeToCall);
		}, timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	};

	if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id)
	{
		clearTimeout(id);
	};
}());
