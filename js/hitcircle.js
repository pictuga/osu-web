function hitCircle(id, prev, input)//class
{
	this.id		= parseInt(id);//used for stacks
	this.previous	= prev;
	
	//init
	
	this.comboKey	= 0;
	this.combo	= 0;
	
	this.sound	= 0;
	
	this.clic	= false;
	this.clicTime	= 0;
	this.score	= 0;
	
	//parse
	
	this.input	= input;
	
	this.x		= this.input[0];
	this.y		= this.input[1];
	
	this.point	= [this.x, this.y];

	this.time	= this.input[2];
	this.type	= this.input[3];
	this.sound	= this.input[4];
	
	switch(this.type)
	{
		case 1:
		case 4:
		case 5:
			this.Type = "circle";
			break;
		
		case 2:
		case 6:
			this.Type = "slider";
			break;
		
		case 8:
		case 12:
			this.Type = "spinner";
			break;
		
		default:
			this.Type = "none";
			log('unknown type', this.type);
			break;
	}

	switch(this.Type)
	{
		case "slider":
			this.sliderData		= this.input[5];
			this.sliderType		= this.input[5][0];
			this.sliderPoints	= this.sliderData.slice(1);
			//this.sliderLast is below
			
			
			this.curveData		= this.input[5];
			this.curveData[0]	= [this.x, this.y];
		
			this.sliderCount	= this.input[6];
			this.repeat		= 1;
			this.sliderLength	= this.input[7];
		
			this.slidePoints = [];
			
			this.sliderSpeed	= 0;
			this.beatLength		= 0;
			
			this.calcSlider();
			
			this.t			= this.sliderLength / this.sliderSpeed;//1 mouvement
			this.duration		= this.sliderCount * this.t;//with repeats
			this.endTime		= this.time + this.duration;
			
			switch(this.sliderType)
			{
				case "B":
					this.bezier = new Bezier(this.curveData);
					this.bezier.max = this.sliderLength;
					this.bezier.calcPoints();
					this.curveData = array_values(this.bezier.pos);
					break;
				case "C":
					this.catmull = new Catmull(this.curveData);
					this.catmull.max = this.sliderLength;
					this.catmull.calcPoints();
					this.curveData = this.catmull.pos;
					break;
			}
			
			this.sliderLast		= this.curveData.slice(-1)[0];
		break;
		case "spinner":
			this.endTime		= this.input[5];
			this.spinPoints = [];
		break;
	}
	
	//init stacks
	if(this.id && this.Type == "circle")
		if(this.previous.input[0] == this.x && this.previous.input[1] == this.y)
		{
			this.x = this.previous.x + 10;
			this.y = this.previous.y + 10;
		}
}

hitCircle.prototype.calcSlider = function()
{
	//beatLength inherited only once (cannot inherit from inherited values)
	//beatLength in ms
	
	var osu = Game.osu;
	
	var i = osu.TimingPoints.length-1;
	while(i >= 0 && this.time < osu.TimingPoints[i][0])
		i--;
	
	i = Math.max(i, 0);
	
	if(osu.TimingPoints[i][1] < 0)
	{
		//inherited
		var li = i;
		while(i >= 0 && osu.TimingPoints[li][1] < 0)
			li--;
		
		li = Math.max(li, 0);
		
		var speed = osu.Difficulty.SliderMultiplier * ( 100 / osu.TimingPoints[li][1] );
		
		this.beatLength = osu.TimingPoints[i][1] / ( -100 * osu.TimingPoints[li][1] );
		this.sliderSpeed = -100 * speed / osu.TimingPoints[i][1];
	}
	else
	{
		this.beatLength = osu.TimingPoints[i][1];
		this.sliderSpeed = osu.Difficulty.SliderMultiplier * ( 100 / this.beatLength );
	}
}

hitCircle.prototype.update = function()
{
	switch(this.Type)
	{
		case "slider":
			if(this.sliderCount > 1)
				this.repeat = Math.ceil((time-this.time) / this.t);//starts at 1
		break;
	}
}
	
hitCircle.prototype.draw = function()
{
	this.update();
	
	switch(this.Type)
	{
		 case "circle":
		 	if(isIn(time, this.time-1500, this.time) && !this.clic)
			{
				this.drawApproach();
				this.drawObject();
			}
		
			if((isIn(time, this.time+100, this.time+500) && !this.clic)
			|| (isIn(time, this.clicTime, this.clicTime+400) && this.clic))
				this.drawScore();
		break;
	
		case "slider":
			//have fun
			var points = this.curveData;
		
			if(isIn(time, this.time-1500, this.time))//approach
			{
				this.drawApproach();
				this.drawObject();
			}
			if(isIn(time, this.time, this.endTime))//sliding
			{
				this.drawObject();
				this.drawBall();
			}
		break;
	
		case "spinner":
			if(isIn(time, this.time, this.endTime))
				this.drawObject();
		break;
	}
	
	this.drawPath();
}


hitCircle.prototype.drawObject = function()
{
	var alpha = (1-(this.time-time)/1500);
	var rgba = this.color(alpha);
	var rgb = this.color();
	
	switch(this.Type)
	{
		case "circle":
			ctx.save();
				ctx.globalCompositeOperation = "destination-over";
	
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
	
				ctx.font = h*circleSize + "px Arial";
				ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
	
				ctx.fillText(this.comboKey, this.x*w, this.y*h);
		
				//reset
				ctx.lineWidth = 1;
				ctx.lineCap = "butt";
	
				//inner
				ctx.beginPath();
					ctx.fillStyle = rgba;
					ctx.circle(this.x*w, this.y*h, h*circleSize*0.95);
				ctx.fill();
	
				//outter
				ctx.beginPath();
					ctx.fillStyle = "rgba(200,200,200," + alpha + ")";
					ctx.circle(this.x*w, this.y*h, h*circleSize);
				ctx.fill();
			ctx.restore();
		break;
	
		case "slider":
			ctx.save();
			ctx.globalCompositeOperation = "destination-over";
		
			//reverse arrow
				if(this.sliderCount > 1)
				{
					if(time > this.time)
						if(this.sliderCount > this.repeat)
						{
							var xy = (this.repeat % 2 == 1) ? this.sliderLast : [this.x, this.y];
							var image = Data.Skin["reversearrow"];
							ctx.drawImageScaled(image, xy[0]*w, xy[1]*h);
						}
					else
					{
						var xy = this.sliderLast;
						var image = Data.Skin["reversearrow"];
						ctx.drawImageScaled(image, xy[0]*w, xy[1]*h);
					}
				}
		
			//circle combo
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
	
				ctx.font = h*circleSize + "px Arial";
				ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
	
				ctx.fillText(this.comboKey, this.x*w, this.y*h);
		
				//reset
				ctx.lineWidth = 1;
				ctx.lineCap = "butt";
	
				//inner
				ctx.beginPath();
					ctx.fillStyle = rgba;
					ctx.circle(this.x*w, this.y*h, h*circleSize*0.95);
				ctx.fill();
	
				//outter
				ctx.beginPath();
					ctx.fillStyle = "rgba(200,200,200," + alpha + ")";
					ctx.circle(this.x*w, this.y*h, h*circleSize);
				ctx.fill();
		
			//inner
				ctx.lineWidth = h*(circleSize*0.95)*2;
				ctx.lineCap = "round"; 
				ctx.lineJoin = "round";
	
				ctx.beginPath(); 
				ctx.strokeStyle = rgba;
	
				for(var i = 0; i <= (this.curveData.length-1); i++)
				{
					if(i == 0)	ctx.moveTo(this.x*w,this.y*h);
					else 		ctx.lineTo(this.curveData[i][0]*w,this.curveData[i][1]*h);
				}
	
				ctx.stroke();
		
			//outter
				ctx.lineWidth = h*circleSize*2;
				ctx.lineCap = "round"; 
				ctx.lineJoin = "round";
	
				ctx.beginPath(); 
				ctx.strokeStyle = "rgba(200,200,200," + alpha + ")";
	
				for(var i = 0; i <= (this.curveData.length-1); i++)
				{
					if(i == 0)	ctx.moveTo(this.x*w,this.y*h);
					else 		ctx.lineTo(this.curveData[i][0]*w, this.curveData[i][1]*h);
				}
	
				ctx.stroke();
			ctx.restore();
		break;
	
		case "spinner":
			var isCircle = checkCircle(this.spinPoints);
		
			if(false)
			{
				//see the drawing ;p
				ctx.save();
				ctx.beginPath();
				ctx.strokeStyle = "Blue";
				for(i in this.spinPoints)
				{
					if(i == 0)	ctx.moveTo(this.spinPoints[i][0]*w, this.spinPoints[i][1]*h);
					else 		ctx.lineTo(this.spinPoints[i][0]*w, this.spinPoints[i][1]*h);
				}
				ctx.stroke();
				ctx.restore();
			}
		
			if(isIn(time, this.time, this.endTime))
			{
				//frame
				var image = Data.Skin["spinner-background"];
				ctx.drawImageAngle(image, (w*512/2), (h*384/2));
			}
		
			if(this.spinPoints.length >= 2)
			{
				var image = Data.Skin["spinner-circle"];
			
				var angle1 =  angleWithCenter(this.spinPoints[0]);
				var angle2 =  angleWithCenter(this.spinPoints[this.spinPoints.length-1]);
			
				angleDiff = mainMesure(angle2 - angle1);
			
				ctx.save();
				ctx.globalCompositeOperation = "source-over";
				ctx.drawImageAngle(image, (w*512/2), (h*384/2), isCircle ? angleDiff : -angleDiff);
				ctx.restore();
			}
		
			if(isIn(time, this.time, this.endTime))
			{
				//progress
				var progress = (1-(this.endTime-time)/(this.endTime-this.time));//1 -> 0
				var image = Data.Skin["spinner-metre"];
				
				ctx.save();
				ctx.globalCompositeOperation = "source-over";
				ctx.drawImage(image,
					0, (image.height-progress*image.height),
					image.width, progress*image.height,
					((512*h-image.width)/2), (((384*h+image.height)/2)-progress*image.height),
					image.width, progress*image.height);
				ctx.restore();
			}
		break;
	}
}

hitCircle.prototype.drawPath = function()
{
	if(!this.previous || (this.Type != "circle" && this.Type != "slider")) return false;
	
	if(this.previous.Type == "slider")
	{
		var fromT = this.previous.endTime;
		var fromD = this.previous.sliderCount % 2 != 0
			? this.previous.sliderLast
			: [this.previous.x, this.previous.y];
	}
	else
	{
		var fromT = this.previous.time;
		var fromD = [this.previous.x, this.previous.y];
	}
	
	if(!isIn(time, fromT, this.time)) return false;

	var progress = 1 - (this.time - time) / (this.time - fromT);
	var to = [this.x, this.y];
	
	var dist = distanceFromPoints([fromD, to]);
	var target =  pointAtDistance([fromD, to], dist*progress);
	
	ctx.save();
		ctx.beginPath();
			ctx.fillStyle = "white";
			ctx.circle(target[0]*w, target[1]*h, 5);
		ctx.fill();
	ctx.restore();
}

hitCircle.prototype.drawApproach = function()
{
	var alpha = (1-(this.time-time)/1500);
	var rgba = this.color(alpha);

	if(!this.clic)
	{
		var taux = ((this.time-time)/1500);
	
		//reset
		ctx.save();
		ctx.lineWidth = 5;
		ctx.lineCap = "butt";
	
		ctx.globalCompositeOperation = "destination-over";
		
		ctx.beginPath();
			ctx.strokeStyle = rgba;
			ctx.circle(this.x*w, this.y*h, (1+3*taux)*circleSize*h);
		ctx.stroke();
		ctx.restore();
	}
}

hitCircle.prototype.drawBall = function()
{
	var slided = false;
	for(i in this.slidePoints)
	{
		if(!slided && this.checkSlide(this.slidePoints[i][0], this.slidePoints[i][1]))
		{
			slided = true;
		}
	}

	var progress = ( ( time - this.time ) - ( this.t * (this.repeat-1) ) ) / this.t;
	var dist = this.sliderLength * progress;
	
	if(this.repeat % 2 == 0)//if going back
		dist = this.sliderLength - dist;

	var at = pointAtDistance(this.curveData, dist);

	if(!isNaN(at[0]) && !isNaN(at[1]))
	{
		//circle
			if(slided)
			{
				ctx.save();
				ctx.globalCompositeOperation = "source-over";
	
				ctx.beginPath();
				ctx.strokeStyle = "yellow";
				ctx.lineWidth = 5;
					ctx.circle(at[0]*w, at[1]*h, circleSize*h*2);
				ctx.stroke();
				ctx.restore();
			}
	
		//ball
			var i = (Math.floor(dist/10) % 10);
			if(this.curveData[at[3]][0] > this.curveData[at[3]+1][0]) i = 9 - i;//fix issues where ball goes backward
		
			var image = Data.Skin["sliderb" + i];
			ctx.save();
				ctx.globalCompositeOperation = "source-over";
				ctx.drawImageScaled(image, at[0]*h, at[1]*w, at[2]);
			ctx.restore();
	}
}

hitCircle.prototype.drawScore = function()
{
	var image = Data.Skin["hit" + this.score];
	ctx.save();
	ctx.globalCompositeOperation = "destination-over";
	ctx.drawImageScaled(image, this.x*w, this.y*h);
	ctx.restore();
}

hitCircle.prototype.calcPoints = function()
{
	if(this.clic)
	{
		var offset = this.time - this.clicTime;
		
		if (offset < 400)
		{
			if	(isIn(offset,  200, 300))	this.score = 50;
			else if	(isIn(offset,   75, 200))	this.score = 100;
			else if	(isIn(offset,  -50,  75))	this.score = 300;
			else if	(isIn(offset, -100, -50))	this.score = 100;
		}
	}
}

hitCircle.prototype.checkHit = function(mouseX, mouseY)
{
	this.clic = isPointInCircle([mouseX, mouseY], this.point, circleSize);
	
	if(this.clic)
	{
		this.clicTime = time;
		this.calcPoints();
	
		//if(this.clic) this.playSound();
	}
	
	return this.clic;
}

hitCircle.prototype.checkSlide = function(mouseX, mouseY)
{
	if(time <= this.time)
	{
		return isPointInCircle([mouseX, mouseY], this.point, circleSize);
	}
	else
	{
		if(isIn(time, this.time-1500, this.endTime))
		{
			var progress = ( ( time - this.time ) - ( this.t * (this.repeat-1) ) ) / this.t;
			var dist = this.sliderLength * progress;
	
			if(this.repeat % 2 == 0)//if going back
				dist = this.sliderLength - dist;

			var at = pointAtDistance(this.curveData, dist);
			
			if(!isNaN(at[0]) && !isNaN(at[1]))
			{
				return isPointInCircle([mouseX, mouseY], [at[0], at[1]], circleSize);
			}
			else return false;
		}
	}
}

hitCircle.prototype.checkSpin = function(mouseX, mouseY)
{
	if(this.spinPoints.length >= 1)
		if(this.spinPoints[this.spinPoints.length-1] != [mouseX, mouseY])
			this.spinPoints.push([mouseX, mouseY]);
	else this.spinPoints.push([mouseX, mouseY]);
}

hitCircle.prototype.color = function()
{
	var key = this.combo % Game.color.length;
	if(arguments[0])
		return "rgba(" + Game.color[key][0] + ", " + Game.color[key][1] + ", " + Game.color[key][2] + ", " + arguments[0] + ")";
	else
		return  "rgb(" + Game.color[key][0] + ", " + Game.color[key][1] + ", " + Game.color[key][2] + ")";
}

hitCircle.prototype.playSound = function()
{
	return false;
	
	var sound_array = ["hitnormal", "hitwhistle"];
	if(this.sound > sound_array.length-1) this.sound = 1;
	
	Data.Sound[sound_array[this.sound]].currentTime = 0;
	Data.Sound[sound_array[this.sound]].play();
}
