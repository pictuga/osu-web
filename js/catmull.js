function Catmull(points)
{
	this.points = points;
	this.order = points.length;
	
	this.step = 0.025;
	this.pos = [];
}

function array_calc(op, array1, array2)
{
	var min = Math.min(array1.length, array2.length);
	var retour = [];
	
	for(var i = 0; i < min; i++)
		retour.push(array1[i] + op*array2[i]);
	
	return retour;
} 

Catmull.prototype.at = function(x, t)
{
	var v1 = (x >= 1 ? this.points[x - 1] : this.points[x]);
	var v2 = this.points[x];
	var v3 = (x + 1 < this.order
		? this.points[x + 1]
		: array_calc('1', v2, array_calc('-1', v2, v1)));
	var v4 = (x + 2 < this.order
		? this.points[x + 2]
		: array_calc('1', v3, array_calc('-1', v3, v2)));
	
	var retour = [];
	for(var i = 0; i <=  1; i++)
	{
		retour[i] = 0.5 *(
		  ( -v1[i] + 3*v2[i] - 3*v3[i] + v4[i])	*t*t*t
		+ (2*v1[i] - 5*v2[i] + 4*v3[i] - v4[i])	*t*t
		+ ( -v1[i]  +  v3[i])			*t
		+  2*v2[i]);
	}
	
	return retour;
}

Catmull.prototype.calcPoints = function()
{
	for (var i = 0; i < this.order - 1; i++)
		for (var t = 0; t < 1+this.step; t+=this.step)
			this.pos.push(this.at(i, t));
}

Catmull.prototype.draw = function(ctx)
{
	this.calcPoints();
	
	ctx.beginPath();
	ctx.moveTo(this.points[0][0], this.points[0][1]);
	for(var i = 1; i < this.pos.length; i++)
		ctx.lineTo(this.pos[i][0], this.pos[i][1]);
	ctx.stroke();
}

Catmull.prototype.drawCP = function(ctx)
{
	ctx.save();
	ctx.strokeStyle = "gray";
	ctx.beginPath();
	for(var i = 0; i < this.order; i++)
	{
		if(!i)	ctx.moveTo(this.points[i][0], this.points[i][1]);
		else	ctx.lineTo(this.points[i][0], this.points[i][1]);
	}
	ctx.stroke();
	ctx.restore();
}
