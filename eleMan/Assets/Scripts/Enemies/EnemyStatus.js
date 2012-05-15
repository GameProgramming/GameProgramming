#pragma strict

//All those fields can be  manually set in the project view.
//Indicates if the enemy is still alive.
var alive : boolean;
//The spawn Point of the enemy if the level loads.
var spawnPoint : SpawnPoint;
//Furthermore we need 2 positions, where he walks between (how to do this?)

function Start () {
	alive = true;
}

function Update () {

	if (!alive) {
		Die();
	}

}

function OnCollisionEnter (collision : Collision) {
	//Ask here for the right collision object, which we don't know right now.
	if (collision.rigidbody.Equals("")) {
	   alive = false;
	}
	
}

function Spawn() {
	//Insert Spawn/Respawn here.
}

function Die() {
	//Remove object from the scene.
}