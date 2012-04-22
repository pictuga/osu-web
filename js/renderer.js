function Renderer(game)
{
	this.game = game;
	this.canvas;
	this.ctx;
	this.requestID;
	this.storyboard	= new Storyboard(this.game);
	this.HH,	this.WW		//total size (including outside the gamefield)(H, W)
	this.H,		this.W		//total percentage (including outside the gamefield)(no ratio)(hp, wp)
	
	this.hh,	this.ww		//gamefield size (+ ratio)(Hr, Wr)
	this.h,		this.w;		//percentage (+ ratio)(h, w)

	this.hs,	this.ws;	//beatmaps coordinates (ratio of course)(MOST USED SO FAR)(thrown to global namespace)
	this.ratio	= false;
}
