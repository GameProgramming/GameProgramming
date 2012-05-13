#pragma strict

//All those fields can be  manually set in the project view.
//Indicates if the enemy is still alive.
var alive : boolean;
//The spawn Point of the enemy if the level loads.
var spawnPoint : SpawnPoint;
//The walking speed of the enemy.
var speed : float;

//Furthermore we need 2 positions, where he walks between (how to do this?)

function Start () {
	alive = true;
	speed = 1.0;
	//How to set spawnPoint?	
}

function Update () {

	if (!alive) {
		Die();
	}

}

function OnCollisionEnter (collision : Collision) {
	//Ask here for the right collision object, which we don't know right now.
	if () {
	   alive = false;
	}
	
}

function Spawn() {
	//Insert Spawn/Respawn here.
}

function Die() {
	//Remove object from the scene.
}