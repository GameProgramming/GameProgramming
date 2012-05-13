#pragma strict

//In this script should be the movement of the enemy.
function Start () {
	while (true) {
		yield Idle();
	}	
}

function Idle () {
	//The direction of the enemy, where he/she is walking to.
	var direction : Vector2;
	//The current position.
	var pos : Transform.position;
}