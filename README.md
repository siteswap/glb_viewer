
Run this command in the project root directory, then select which page you want:
	python -m http.server

TIP: Keep each file small and modular, so that Claude/GPTo1 can keep writing all the code!
NOTE: Claude was (slowly) able to start the python server and run the code, but had no idea how to test it. It's quicker to do it yourself.


TODO:
	1) Rotate the rings on all 3 axes
	2) Increase score when collision (either fp or green shot)
	3) Add smart-trainer controls to PhysicsController:
		- Bluetooth zwifthub for speed
		- Gyroscope for steering (also buttons incase that doesn't work well)
	4) Create sky/walls around the edge of the city
	5) Create multiplayer mamil-blast.com with a central server and websocket/json updates (portfolio)


