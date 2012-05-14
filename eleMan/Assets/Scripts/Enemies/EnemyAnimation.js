//The current position of the enemy.
private var position : Vector2;
//The direction of the enemy, where he is walking.
private var direction : Vector2;
var left = true;

//In this script should be the movement of the enemy.
//Furthermore we need 2 positions, where he walks between (how to do this?) e.g. with 2 points in the gameobjects.
//Or should we just show if the collision is over and then change the direction?

function Start() {
	position = transform.position;
	direction = new Vector2(0, 0);
}

function Update() {
	//We need here two conditions, where the enemy changes his direction.
	//e.g. like the hang time in the player animation?
	if (left) {
		direction = new Vector2(1, 0);
	} else {
		direction = new Vector2(0, 1);
	}
	
}