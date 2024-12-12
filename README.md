
Run this command in the project root directory, then select which page you want:
	python -m http.server

TIP: Keep each file small and modular, so that Claude/GPTo1 can keep writing all the code!
NOTE: Claude was (slowly) able to start the python server and run the code, but had no idea how to test it. It's quicker to do it yourself.


TODO:
	0) Break up PhysicsController.update in to mobius.update, plasma.update etc.
	1) Break out a MovementController module (that could be swapped/extended with bluetooth)
	2) Break up PhysicsController in to MovementControl, MobiusRingLoader, BlastSystem etc.
	3) Add smart-trainer controls to PhysicsController:
		- Bluetooth zwifthub for speed
		- Gyroscope for steering (also buttons incase that doesn't work well)
	---- Phase II  ----
	4) MONSTERS that attack - for Fraser
	---- Phase III ----
	5) Create sky/walls around the edge of the city
	6) Create multiplayer mamil-blast.com with a central server and websocket/json updates (portfolio)


