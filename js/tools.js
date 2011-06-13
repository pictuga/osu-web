"use strict";

window.alert = function(txt){newjWindow(txt)};

function log()
{
	if(window.console)
		console.log(arguments.length == 1 ? arguments[0] : arguments);
}

function isFunction(prop)
{
    return (typeof prop == 'function');
}

function isIn(value, start, end)
{
	return (value >= Math.min(start, end) && value <= Math.max(end));
}

HTMLImageElement.prototype.toDataURL = function()
{
	var canvas = $('<canvas/>', {width: this.naturalWidth, height: this.naturalHeight}).get();
	canvas.getContext("2d").drawImage(this, 0, 0);
	return canvas.toDataURL();
}

CanvasRenderingContext2D.prototype.clear = function()
{
	this.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

CanvasRenderingContext2D.prototype.circle = function(x, y, radius)
{
	this.arc(x, y, radius, 0, Math.PI*2, 0);
}

CanvasRenderingContext2D.prototype.drawImageAngle = function(image, x, y, angle)//angle + center
{
	if(typeof angle != 'undefined' && mainMesure(angle) != 0)
	{
		this.save();
		
		this.translate(x, y);
		this.rotate(angle);
		this.drawImage(image, -image.width/2, -image.height/2);
		
		this.restore();
	}
	else
	{
		this.drawImage(image, (x - image.width/2), (y - image.height/2));
	}
}
