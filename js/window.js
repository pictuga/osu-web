function removejWindow()
{
	if(document.getElementById("jWindow")) document.body.removeChild(document.getElementById("jWindow"));
}

function newjWindow(txt)
{
	if(!document.getElementById("jWindow"))
	{
		//cadre
			var jWindow = document.createElement("div");
			jWindow.id = "jWindow";
		
			jWindow.style.left = (window.innerWidth/2 - jWindow.offsetWidth/2) + "px";
			jWindow.style.top = (window.innerHeight/2 - jWindow.offsetHeight/2) + "px";
		
		//zone de texte
			var jWindowText = document.createElement("div");
			jWindowText.id = "jWindowText";
			jWindowText.innerHTML = txt;
		
		jWindow.onmousedown = function(e)
		{
			if (e == null)e = window.event;
			var target = e.target != null ? e.target : e.srcElement;
			
			if (target.id == "jWindow")
			{
				savedTarget = target;
				dragOK = true;
				savedTarget.style.cursor = "move";
				dragXoffset = e.clientX - parseInt(jWindow.style.left);
				dragYoffset = e.clientY - parseInt(jWindow.style.top);
				
				document.onmousemove = function(e)
				{
					if (e == null) e = window.event;
					var target = e.target != null ? e.target : e.srcElement;
					
					if (e.button <= 1 && dragOK)
					{
						var newX = e.clientX - dragXoffset;
						var newY = e.clientY - dragYoffset;
						
						if(newX < 0) newX = 0;
						if(newY < 0) newY = 0;
						
						if(newX > (window.innerWidth -jWindow.offsetWidth )) newX = (window.innerWidth -jWindow.offsetWidth);
						if(newY > (window.innerHeight-jWindow.offsetHeight)) newY = (window.innerHeight-jWindow.offsetHeight);
						
						savedTarget.style.left = newX + 'px';
						savedTarget.style.top = newY + 'px';
						return false;
					}
				}
				
				document.onmouseup = function(e)
				{
					document.onmousemove = null;
					document.onmouseup = null;
					dragOK = false;
					savedTarget.style.cursor = "default";
				}
				
				return false;
			}
		}
		
		jWindow.appendChild(jWindowText);
		document.body.appendChild(jWindow);
	}
	else
	{
		//changer txt
		document.getElementById("jWindowText").innerHTML = txt;
	}
}
