var log = console.log;

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
	p = parseInt(p), n = parseInt(n);
	return Math.round( factorial(n) / ( factorial(p) * factorial(n-p) ) );
}

function Bezier(points)
{
	this.points = points;
	this.order = points.length;
	
	this.step = 0.025;
	
	this.pos = {};
}

Bezier.prototype.at = function(t)
{
	//B(t) = sum_(i=0)^n (i parmis n) (1-t)^(n-i) * t^i * P_i
	
	if(this.pos[t]) return this.pos[t];
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

Bezier.prototype.draw = function(ctx)
{
	ctx.beginPath();
	for(var i = 0; i < 1+this.step; i+= this.step)
	{
		var point = this.at(i);
		log(i, point);
		
		if(!i)	ctx.moveTo(point[0], point[1]);
		else	ctx.lineTo(point[0], point[1]);
	}
	ctx.stroke();
}

Bezier.prototype.drawCP = function(ctx)
{
	ctx.beginPath();
	for(var i = 0; i < this.order; i++)
	{
		if(!i)	ctx.moveTo(this.points[i][0], this.points[i][1]);
		else	ctx.lineTo(this.points[i][0], this.points[i][1]);
	}
	ctx.stroke();
}
