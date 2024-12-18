
Run this command in the project root directory, then select which page you want:
	python -m http.server

TIP: Keep each file small and modular, so that Claude/GPTo1 can keep writing all the code!
TIP: A common guideline is to aim for modules under 300–500 lines of code
	NOTE: - This is where Claude/GPT performance starts to falls off, so it's a great rule to stick with!!!


TODO:
	1) Check efficiency of current physics. Profile the code.
	----------------------------
	Can create different levels just by changing the set up and ring placement. 
	E.g. 
		All flyMode, place rings at random heights in the air.
		All rings on roofs
		Time Trial - Respawn rings, max rings in 20 mins.
		Night time - can Three.js add this to existing scene?
		Time Trial - Get around the city loop in min time (rings show you the route).
	----------------------------
	Productionize & monetize asap
		- Stripe (ad-free, $1 / month)
		- Ad-sense 
	---- Phase - progression ----
	1) Pickups for changing guns/speed/fly
	1) MONSTERS that follow you - expensive in Three.js with current physics
	---- Phase IV  ----
	This kind of stuff is well supported in Unity
	1) Host a central server with websocket/json updates 
	2) Multi-player: access from desktop & ipad at same time.
		- Be a second rider
		- Be the 'gunner' for the first rider
	3) LAN host option for performance 


All the common FPV features:
	Weapons pick ups
	Monsters chase / shoot
	Buy improvements / customisations
	Big boss
	Online multiplayer arena
		
