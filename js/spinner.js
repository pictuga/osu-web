function angleWithCenter(pt)
{
	//512÷384
	var center = [512/2, 384/2];
	
	var rawAngle = angleFromPoints(pt, center);
	var angle = (pt[0] > center[0]) ? rawAngle : rawAngle-Math.PI;
	
	return mainMesure(angle);
}

function mainMesure(angle)//-pi < angle < pi
{
	while(angle > Math.PI)
		angle -= 2*Math.PI;

	while(angle < -Math.PI)
		angle += 2*Math.PI;
		
        return angle;
}

function checkCircle(points)
{
	if(points.length <= 3) isCircle = true;
	else
	{
		for(i = 2; i <= points.length-1; i++)
		{
			var angle0 =  angleWithCenter(points[i-2]);
			var angle1 =  angleWithCenter(points[i-1]);
			var angle2 =  angleWithCenter(points[i-0]);
		
			angleDiff = mainMesure(angle2 - angle1);
				angleSign = (angleDiff/Math.abs(angleDiff));
			angleDiffPrec = mainMesure(angle1 - angle0);
				angleSignPrec = (angleDiffPrec/Math.abs(angleDiffPrec));
		
			var isCircle = (angleSign == angleSignPrec || Math.min(Math.abs(angleDiff), Math.abs(angleDiffPrec)) == 0);
			if(!isCircle) break;
		}
	}
	
	return isCircle;
}
