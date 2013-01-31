function factorial(n)
{
	n = parseInt(n);
	
	if(!n) return 1;
	
	var result = 1;
	for(var i = 1; i <= n; i++) result *= i;
	
	return result;
}

function Cpn(p, n)
{
	if(p < 0 || p > n)
		return 0;
	var p = Math.min(p, n-p);
	var out = 1;
	for(var i = 1; i < p+1; i++)
		out = out * (n - p + i) / i;
	return out;
}

function array_values(array)
{
	var out = [];
	for(var i in array) out.push(array[i]);
	return out;
}

function array_calc(op, array1, array2)
{
	var min = Math.min(array1.length, array2.length);
	var retour = [];
	
	for(var i = 0; i < min; i++)
		retour.push(array1[i] + op*array2[i]);
	
	return retour;
}

/*************************************************************/

function Bezier(points)
{
	this.points = points;
	this.order = points.length;
	
	this.step = 0.025 / this.order;
	this.pos = {};
}

Bezier.prototype.at = function(t)
{
	//B(t) = sum_(i=0)^n (i parmis n) (1-t)^(n-i) * t^i * P_i
	if(typeof this.pos[t] != "undefined") return this.pos[t];
	var x = 0, y = 0;
	var n = this.order-1;
	
	for(var i = 0; i <= n; i++)
	{
		x += Cpn(i, n) * Math.pow((1-t), (n-i)) * Math.pow(t, i) * this.points[i][0];
		y += Cpn(i, n) * Math.pow((1-t), (n-i)) * Math.pow(t, i) * this.points[i][1];
	}
	
	this.pos[t] = [x, y];
	
	return [x, y];
}

Bezier.prototype.calcPoints = function()
{
	if(this.pos.length) return;
	for(var i = 0; i < 1+this.step; i+= this.step)
		this.at(i);
}

Bezier.prototype.draw = function(ctx)
{
	ctx.beginPath();
	if(this.order) ctx.moveTo(this.points[0][0], this.points[0][1])
	switch(this.order)
	{
		case 0:
			//fuck
			log('useless0');
			break;
		case 1:
			//fuck too
			log('useless1');
			break;
		
		case 2:
			log('line');
			ctx.lineTo(this.points[1][0], this.points[1][1]);
			break;
		
		case 3:
			log('quadratic');
			ctx.quadraticCurveTo(this.points[1][0], this.points[1][1], this.points[2][0], this.points[2][1]);
			break;
		
		case 4:
			log('bezier');
			ctx.bezierCurveTo(this.points[1][0], this.points[1][1], this.points[2][0], this.points[2][1], this.points[3][0], this.points[3][1]);
			break;
		
		default:
			log('home made');
			this.calcPoints();
			var i;
			for(var i in this.pos)
			{
				ctx.lineTo(this.pos[i][0], this.pos[i][1]);
			}
			break;
	}
	ctx.stroke();
}

/*************************************************************/

Bezier.prototype.drawCP = Catmull.prototype.drawCP = function(ctx)
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

Bezier.prototype.pointAtDistance = Catmull.prototype.pointAtDistance = function(dist)
{
	switch(this.order)
	{
		case 0:
			return false;
		case 1:
			return this.points[0];
		default:
			this.calcPoints();
			return pointAtDistance(array_values(this.pos), dist).slice(0,2);
	}
}

/*************************************************************/

function Catmull(points)
{
	this.points = points;
	this.order = points.length;
	
	this.step = 0.025;
	this.pos = [];
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
	if(this.pos.length) return;
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
