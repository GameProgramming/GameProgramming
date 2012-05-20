#pragma strict

//All those fields can be  manually set in the project view.
//Indicates if the enemy is still alive.
var alive : boolean;
//The spawn Point of the enemy if the level loads/respawns.
//I would suggest that the spawn point has the child enemy.
var spawnPoint : SpawnPoint;

function Start () {
	alive = true;
	Spawn();
}

function Update () {

	if (!alive) {
		Die();
	}

}

function OnCollisionEnter (collision : Collision) {
	//Ask here for the right collision object, which we don't know right now.
	if (collision.rigidbody.Equals("Projectile")) {
	   alive = false;
	   Destroy(collision.transform.gameObject);
	}
	
}

function Spawn() {
	transform.position = spawnPoint.transform.position;
}

function Die() {
	Destroy(transform.gameObject);
}