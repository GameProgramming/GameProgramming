#pragma strict

//All those fields can be  manually set in the project view.
//Indicates if the enemy is still alive.
var alive : boolean;
//The spawn Point of the enemy if the level loads.
var spawnPoint : SpawnPoint;

function Start () {
	alive = true;
	spawnPoint = transform.GetChild("SpawnPoint");
	Spawn();
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
	transform.position = spawnPoint.transform.position;
}

function Die() {
	//Question here is if we destroy it or not. because we need the children to be a spawnpoint
	//And if we destroy the object, the spawnPoint is also gone.
}