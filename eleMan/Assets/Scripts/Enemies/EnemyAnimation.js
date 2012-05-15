//The current position of the enemy.
private var position : Vector2;
//The direction of the enemy, where he is walking.
private var direction : Vector2;
var left = true;
//The walking animation of the enemy.
var walk;
private var walkSpeedModifier = 2.5;
var idle;

//In this script should be the movement of the enemy.
//Furthermore we need 2 positions, where he walks between (how to do this?) e.g. with 2 points in the gameobjects.
//Or should we just show if the collision is over and then change the direction?

function Start() {
	//By default loop the animations.
	animation.Stop();
	animation.wrapMode = WrapMode.Loop;
	//Starting walk of the enemy.
	walk = animation["EnemyWalk"];
	walk.speed *= walkSpeedModifier;
	//Idle animation.
	//idle = animation["idle"];
	//Store the position of the initial value.
	position = transform.position;
}

function Update() {
	//We need here two conditions, where the enemy changes his direction.
	//e.g. like the hang time in the player animation?
	animation.CrossFade("EnemyWalk");
}