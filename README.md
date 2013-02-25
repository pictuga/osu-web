#osu! web - osu! for browsers 
---

##Information

This project began as a kind of proof of concept, to show that *osu!*, a Windows only game could be ported to html5. It was also the first ever real estate project from its developer, who is learning a lot from this project. Therefore, the project is currently being heavily rewritten to make it more Object-Oriented. This project was started in my free time at schoool (hence the project began in September), and the most of the inital development was done at school, which explains why the development is so slow. Now the main (and sole) dev is at universiy, and for now doesn't have enough time to take care of osu-web the way it should be. Therefore development often hangs, and sometimes starts over for a couple of days, during holidays.

The project tries to remain as simple as possible, with no server side, wich turns out to be useless for whar we are doing. Everything is served by a "stupid" http server, through AJAX. Apache specific settings were dropped so as to be able to run the game from any server. Code can be browsed right from the server, since the code is not "optimized", since for know it's not requiered, since it would just make development harder.

##Beatmap storage

	beatmap/
		100/
		101/
		102/
		.../
	conv/
		100.ogg
		101.ogg
		102.ogg
		...ogg
		
* 1 beatmap per folder, folder name = beatmap id
* .ogg conversion in conv/

##Configuration

Various paths can be changed in `js/main.js`

##Usage

Most http servers should work since we dropped apache specific configurations for translations delivery.

Apache and python's SimpleHTTPServer have been tested successfully. Please note that you **need** an http server to play the game, ie. you can't just run the game from `file://` in your web browser.
