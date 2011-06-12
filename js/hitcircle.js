function hitCircle(id, input)//class
{
	this.id = parseInt(id);//used for stacks
	this.previous = this.id ? hc[this.id-1] : false;
	
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
	//FIXME
	//beatLength inherited only once (cannot inherit from inherited values)
	//beatLength in ms
	
	var i = osu_file.TimingPoints.length-1;
	while(i >= 0 && this.time < osu_file.TimingPoints[i][0])
		i--;
	
	if(osu_file.TimingPoints[i][1] < 0)
	{
		//inherited
		var li = i;
		while(i >= 0 && osu_file.TimingPoints[li][1] < 0)
			li--;
		
		var speed = osu_file.Difficulty.SliderMultiplier * ( 100 / osu_file.TimingPoints[li][1] );
		
		this.beatLength = osu_file.TimingPoints[i][1] / ( -100 * osu_file.TimingPoints[li][1] );
		this.sliderSpeed = -100 * speed / osu_file.TimingPoints[i][1];
	}
	else
	{
		this.beatLength = osu_file.TimingPoints[i][1];
		this.sliderSpeed = osu_file.Difficulty.SliderMultiplier * ( 100 / this.beatLength );
	}
}

hitCircle.prototype.update = function()
{
	switch(this.Type)
	{
		case "slider":
			if(this.sliderCount > 1)
			{
				this.repeat = Math.ceil((time-this.time) / this.t);//starts at 1
			}
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
			var size = circleSize;
			
			ctx.save();
				ctx.globalCompositeOperation = "destination-over";
	
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
	
				ctx.font = hs*size + "px Arial";
				ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
	
				ctx.fillText(this.comboKey, this.x*ws, this.y*hs);
		
				//reset
				ctx.lineWidth = 1;
				ctx.lineCap = "butt";
	
				//inner
				ctx.beginPath();
					ctx.fillStyle = rgba;
					ctx.circle(this.x*ws, this.y*hs, hs*size*0.95);
				ctx.fill();
	
				//outter
				ctx.beginPath();
					ctx.fillStyle = "rgba(200,200,200," + alpha + ")";
					ctx.circle(this.x*ws, this.y*hs, hs*size);
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
					{
						if(this.sliderCount > this.repeat)
						{
							var xy = (this.repeat % 2 == 1) ? this.sliderLast : [this.x, this.y];
							var image = pic["reversearrow"];
							ctx.drawImageAngle(image, xy[0]*ws, xy[1]*hs);
						}
					}
					else
					{
						var xy = this.sliderLast;
						var image = pic["reversearrow"];
						ctx.drawImageAngle(image, xy[0]*ws, xy[1]*hs);
					}
				}
		
			//circle combo
				var size = circleSize;
		
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
	
				ctx.font = hs*size + "px Arial";
				ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
	
				ctx.fillText(this.comboKey, this.x*ws, this.y*hs);
		
				//reset
				ctx.lineWidth = 1;
				ctx.lineCap = "butt";
	
				//inner
				ctx.beginPath();
					ctx.fillStyle = rgba;
					ctx.circle(this.x*ws, this.y*hs, hs*size*0.95);
				ctx.fill();
	
				//outter
				ctx.beginPath();
					ctx.fillStyle = "rgba(200,200,200," + alpha + ")";
					ctx.circle(this.x*ws, this.y*hs, hs*size);
				ctx.fill();
		
			//inner
				ctx.lineWidth = hs*(size*0.95)*2;
				ctx.lineCap = "round"; 
				ctx.lineJoin = "round";
	
				ctx.beginPath(); 
				ctx.strokeStyle = rgba;
	
				for(var i = 0; i <= (this.curveData.length-1); i++)
				{
					if(i == 0)	ctx.moveTo(this.x*ws,this.y*hs);
					else 		ctx.lineTo(this.curveData[i][0]*ws,this.curveData[i][1]*hs);
				}
	
				ctx.stroke();
		
			//outter
				ctx.lineWidth = hs*size*2;
				ctx.lineCap = "round"; 
				ctx.lineJoin = "round";
	
				ctx.beginPath(); 
				ctx.strokeStyle = "rgba(200,200,200," + alpha + ")";
	
				for(var i = 0; i <= (this.curveData.length-1); i++)
				{
					if(i == 0)	ctx.moveTo(this.x*ws,this.y*hs);
					else 		ctx.lineTo(this.curveData[i][0]*ws, this.curveData[i][1]*hs);
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
					if(i == 0)	ctx.moveTo(this.spinPoints[i][0]*ws, this.spinPoints[i][1]*hs);
					else 		ctx.lineTo(this.spinPoints[i][0]*ws, this.spinPoints[i][1]*hs);
				}
				ctx.stroke();
				ctx.restore();
			}
		
			if(isIn(time, this.time, this.endTime))
			{
				//frame
				var image = pic["spinner-background"];
				ctx.drawImageAngle(image, (Wr/2), (Hr/2));
			}
		
			if(this.spinPoints.length >= 2)
			{
				var image = pic["spinner-circle"];
			
				var angle1 =  angleWithCenter(this.spinPoints[0]);
				var angle2 =  angleWithCenter(this.spinPoints[this.spinPoints.length-1]);
			
				angleDiff = mainMesure(angle2 - angle1);
			
				ctx.save();
				ctx.globalCompositeOperation = "source-over";
				ctx.drawImageAngle(image, (Wr/2), (Hr/2), (isCircle) ? angleDiff : -angleDiff);
				ctx.restore();
			}
		
			if(isIn(time, this.time, this.endTime))
			{
				//progress
				var progress = (1-(this.endTime-time)/(this.endTime-this.time));//1 -> 0
				var image = pic["spinner-metre"];
				
				ctx.save();
				ctx.globalCompositeOperation = "source-over";
				ctx.drawImage(image,
					0, (image.height-progress*image.height),
					image.width, progress*image.height,
					((Wr-image.width)/2), (((Hr+image.height)/2)-progress*image.height),
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
			ctx.circle(target[0]*ws, target[1]*hs, 5);
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
			ctx.circle(this.x*ws, this.y*hs, (1+3*taux)*circleSize*hs);
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
					ctx.circle(at[0]*ws, at[1]*hs, circleSize*hs*2);
				ctx.stroke();
				ctx.restore();
			}
	
		//ball
			var i = (Math.floor(dist/10) % 10);
			if(this.curveData[at[3]][0] > this.curveData[at[3]+1][0]) i = 9 - i;//fix issues where ball goes backward
		
			var image = pic["sliderb" + i];
			ctx.save();
				ctx.globalCompositeOperation = "source-over";
				ctx.drawImageAngle(image, at[0]*hs, at[1]*ws, at[2]);
			ctx.restore();
	}
}

hitCircle.prototype.drawScore = function()
{
	var image = pic["hit" + this.score];
	ctx.save();
	ctx.globalCompositeOperation = "destination-over";
	ctx.drawImageAngle(image, this.x*ws, this.y*hs);
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
	var radius = circleSize * 1.25;
	
	ctx.beginPath();
	ctx.circle(this.x, this.y, radius);
	this.clic = ctx.isPointInPath(mouseX, mouseY);
	
	this.clicTime = time;
	this.calcPoints();
	
	if(this.clic) this.playSound();
	
	return this.clic;
}

hitCircle.prototype.checkSlide = function(mouseX, mouseY)
{
	if(time <= this.time)
	{
		var radius = circleSize * 1.25;
	
		ctx.beginPath();
		ctx.circle(this.x, this.y, radius);
		return ctx.isPointInPath(mouseX, mouseY);
	}
	else
	{
		var radius = circleSize * 1.25;
	
		if(isIn(time, this.time-1500, this.endTime))
		{
			var progress = ( ( time - this.time ) - ( this.t * (this.repeat-1) ) ) / this.t;
			var dist = this.sliderLength * progress;
	
			if(this.repeat % 2 == 0)//if going back
				dist = this.sliderLength - dist;

			var at = pointAtDistance(this.curveData, dist);
			
			if(!isNaN(at[0]) && !isNaN(at[1]))
			{
				ctx.beginPath();
				ctx.circle(at[0], at[1], radius);
				return ctx.isPointInPath(mouseX, mouseY);
			}
			else return false;
		}
	}
}

hitCircle.prototype.checkSpin = function(mouseX, mouseY)
{
	if(this.spinPoints.length >= 1)
	{
		if(this.spinPoints[this.spinPoints.length-1] != [mouseX, mouseY])
		{
			this.spinPoints.push([mouseX, mouseY]);
		}
	}
	else this.spinPoints.push([mouseX, mouseY]);
}

hitCircle.prototype.color = function()
{
	var key = this.combo % color.length;
	if(arguments[0])
	{
		return "rgba(" + color[key][0] + ", " + color[key][1] + ", " + color[key][2] + ", " + arguments[0] + ")";
	}
	else
	{
		return "rgb(" + color[key][0] + ", " + color[key][1] + ", " + color[key][2] + ")";
	}
}

hitCircle.prototype.playSound = function()
{
	return false;
	
	var sound_array = ["hitnormal", "hitwhistle"];
	if(this.sound > sound_array.length-1) this.sound = 1;
	
	sounds[sound_array[this.sound]].currentTime = 0;
	sounds[sound_array[this.sound]].play();
}
