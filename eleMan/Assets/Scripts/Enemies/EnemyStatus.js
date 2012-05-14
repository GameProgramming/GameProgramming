//All those fields can be  manually set in the project view.

//Indicates if the enemy is still alive.
var alive : boolean;
//The spawn Point of the enemy if the level loads.
var spawnPoint : SpawnPoint;
//The walking speed of the enemy.
var speed : float;

function Start () {
	alive = true;
	speed = 1.0;
	Spawn();
}

function Update () {


}

function OnCollisionEnter (collision : Collision) {
	//Ask here for the right collision object, which we don't know right now.
	if (alive == true) {
	   alive = false;
	   Die();
	}
	
}

function Spawn() {
	//Insert Spawn/Respawn here.
	transform.position = spawnPoint.transform.position;
}

function Die() {
	//Remove object from the scene.
	//And finally respawn.
}