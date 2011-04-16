function angleWithCenter(x, y)
{
	//512÷384
	
	var xc = 512/2;
	var yc = 384/2;
	
	var rawAngle = angleFromPoints(x, y, xc, yc);
	var angle = (x > xc) ? rawAngle : rawAngle-Math.PI;
	
	return mainMesure(angle);
}

function mainMesure(angle)//-pi < angle < pi
{
	while(angle > Math.PI)
	{
		angle -= 2*Math.PI;
	}
	
	while(angle < -Math.PI)
	{
		angle += 2*Math.PI;
	}
	
	return angle;
}

function checkCircle(points)
{
	if(points.length <= 3) isCircle = true;
	else
	{
		for(i = 2; i <= points.length-1; i++)
		{
			var angle0 =  angleWithCenter(points[i-2][0], points[i-2][1]);
			var angle1 =  angleWithCenter(points[i-1][0], points[i-1][1]);
			var angle2 =  angleWithCenter(points[i-0][0], points[i-0][1]);
		
			angleDiff = mainMesure(angle2 - angle1);
				angleSign = (angleDiff/Math.abs(angleDiff));
			angleDiffPrec = mainMesure(angle1 - angle0);
				angleSignPrec = (angleDiffPrec/Math.abs(angleDiffPrec));
		
			var isCircle = (angleSign == angleSignPrec || Math.min(Math.abs(angleDiff), Math.abs(angleDiffPrec)) == 0);
			if(isCircle == false) break;
		}
	}
	
	return isCircle;
}
