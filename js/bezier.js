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

Bezier.prototype.drawCP = function(ctx)
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

Bezier.prototype.pointAtDistance = function(dist)
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

function array_values(array)
{
	var out = [];
	for(var i in array) out.push(array[i]);
	return out;
}
