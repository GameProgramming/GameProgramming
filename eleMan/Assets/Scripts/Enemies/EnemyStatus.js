//All those fields can be  manually set in the project view.
//Indicates if the enemy is still alive.
var alive : boolean;
//The spawn Point of the enemy if the level loads/respawns.
//I would suggest that the spawn point has the child enemy.
var spawnPoint : Transform;

function Start () {
	alive = true;
	Spawn();
}

function Update () {
	if (!alive) {
		Die();
	}
}

function OnTriggerEnter (collision : Collider) {
	//Ask here for the right collision object, which we don't know right now.
	if (collision.gameObject.tag.Equals("Projectile")) {
	   alive = false;
	   Destroy(collision.transform.gameObject);
	}
	Debug.Log("Test");
	if (collision.gameObject.tag.Equals("Player")) {
		collision.gameObject.SendMessage("OnDeath", SendMessageOptions.DontRequireReceiver);
	}
}

function Spawn() {
	transform.position = spawnPoint.transform.position;
	transform.parent.position = spawnPoint.transform.position;
}

function Die() {
	Destroy(transform.gameObject);
}