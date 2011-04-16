function isFunction(prop)
{
    return (typeof prop == 'function');
}

function isIn(value, start, end)
{
	return (value >= start && value <= end);
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
		var side = Math.max(image.width, image.height);
	
		var canvas = document.createElement("canvas");
		canvas.width = canvas.height = side;
		// ↑ supports non-square images

		if (!canvas.getContext) return false;
		
		var ctxs = canvas.getContext("2d");
		ctxs.save();
		ctxs.clearRect(0, 0, side, side);
		ctxs.translate(side/2, side/2);
		ctxs.rotate(angle);
		ctxs.drawImage(image, (-image.width/2), (-image.height/2));
		ctxs.restore();

		this.drawImage(canvas, (x - side/2), (y - side/2));
	}
	else
	{
		this.drawImage(image, (x - image.width/2), (y - image.height/2));
	}
}

Storage.prototype.setObject = function(key, value)
{
	var fail = false;
	do
	{
		if(fail)
		{
			if(value.length == 0)
			{
				log('can\'t save anything');
				return false;
			}
			else
			{
				var i;
				for(i in value)
				{
					delete value[i];
					break;
				}
			}
		}
		
		try
		{
			this.setItem(key, JSON.stringify(value));
			return true;
		}
		catch (e)
		{
			log('quota exceeded');
			fail = true;
		}
	} while(fail == true);
}

Storage.prototype.getObject = function(key)
{
	var content = this.getItem(key);
	return content != null ? JSON.parse(content) : false;
}
