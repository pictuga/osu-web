var settings =
{
	options :
	{
		light:	{
				title:	"Use light version",
				desc:	"Use less images, draw shapes instead",
				default:false
			},
		full:	{
				title:	"Full background",
				desc: 	"Fill the screen with the background",
				default:true
			}
	},
	
	init : function()
	{
		for(var i in this.options)
		{
			this.options[i].value = this.options[i].default;
		}
	},
	
	reset : function(id)
	{
		this.options[id].value = this.options[id].default;
	},
	
	show : function(target)
	{
		//target : destionation DOM element (<div> ?)
		for(var id in this.options)
		{
			var self = this.options[id];
			
			var div = $('<div/>')
			.append($('<div/>', {html: self.title}))
			.append($('<div/>', {html: self.desc}))
			.appendTo(target);
			
			switch(typeof self.default)
			{
				case 'boolean':
					$('<input/>', {type: 'checkbox', name: id}).attr('checked', self.value).appendTo(div);
					break;
				default:
					log('nothing to do for this setting', self);
					break;
			}
		}
	},
	
	save : function()
	{
		log('dunno how to save :\'(');
	}
}
