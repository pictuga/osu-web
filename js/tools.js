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
		ctx.save();
		
		ctx.translate(x, y);
		ctx.rotate(angle);
		ctx.drawImage(image, -image.width/2, -image.height/2);
		
		ctx.restore();
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
