function isPointInCircle(point, center, radius)
{
	return distancePoints(point, center) <= radius;
}

function distancePoints(p1, p2)
{
	var x = (p1[0]-p2[0]);
	var y = (p1[1]-p2[1]);
	return Math.sqrt(x*x+ y*y);
}

function distanceFromPoints(array)
{
	var distance = 0;
	
	for(i = 1; i <= array.length - 1; i++)
		distance += distancePoints(array[i], array[i-1]);
	
	return distance;
}

function angleFromPoints(p1, p2)
{
	return Math.atan((p2[1]-p1[1])/(p2[0]-p1[0]));
}

function cartFromPol(r, teta)
{
	x2 = (r*Math.cos(teta));
	y2 = (r*Math.sin(teta));

	return [x2, y2];
}
	
function pointAtDistance(array, distance)
{
	//needs a serious cleanup !
	
	var current_distance = 0;
	var last_distance = 0;
	
	if(array.length < 2) return [0, 0, 0, 0];
	
	if(distance == 0)
	{
		var angle = angleFromPoints(array[0], array[1]);
		return [array[0][0], array[0][1], angle, 0];
	}
	
	if(distanceFromPoints(array) <= distance)
	{
		var angle = angleFromPoints(array[array.length-2], array[array.length-1]);
		return	[array[array.length-1][0], array[array.length-1][1],
			angle, array.length-2];
	}
	
	for(i = 0; i <= array.length - 2; i++)
	{
		x = (array[i][0]-array[i+1][0]);
		y = (array[i][1]-array[i+1][1]);
		
		new_distance = (Math.sqrt(x*x+y*y));
		current_distance += new_distance;
		
		if(distance <= current_distance) break;
	}
	
	current_distance -= new_distance;
	
	if(distance == current_distance)
	{
		var coord = [array[i][0], array[i][1]];
		var angle = angleFromPoints(array[i], array[i+1]);
	}
	else
	{
		var angle = angleFromPoints(array[i], array[i+1]);
		var cart = cartFromPol((distance - current_distance), angle);
		
		if(array[i][0] > array[i+1][0])
			var coord = [(array[i][0] - cart[0]), (array[i][1] - cart[1])];
		else 	var coord = [(array[i][0] + cart[0]), (array[i][1] + cart[1])];
	}
	
	if(isNaN(coord[0]) || isNaN(coord[1]))
	{
		log((array[i][0] >= array[i+1][0]), cart, coord, array[i], array[i+1]);
	}
	
	return [coord[0], coord[1], angle, i];
}
