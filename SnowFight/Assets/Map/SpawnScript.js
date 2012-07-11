//We need occupy especially for the start of a level.
private var occupied : boolean;
//Indicates if a player is in the spawn.
private var playerInSpawn : boolean;
private var occupiedTime : float = 0.0;

function Start () {
	occupied = false;
	playerInSpawn = false;
}

function Update () {
	//After a certain time we can set it to false.
	//The we can use the player in spawn only.
	if (occupied) {
		occupiedTime += Time.deltaTime;
		if (occupiedTime >= 1.5) {
			occupied = false;
			occupiedTime = 0.0;
		}
	}
}

function OnTriggerEnter (other : Collider) {
	if (other.tag.Equals("Player")) {
		playerInSpawn = true;
	}
}

function OnTriggerStay (other : Collider) {
	if (other.tag.Equals("Player")) {
		playerInSpawn = true;
	}
}

function OnTriggerExit (other : Collider) {
	if (other.tag.Equals("Player")) {
		playerInSpawn = false;
	}
}

function IsOccupied () : boolean {
	return occupied;
}

function SetOccupied (newOccupied : boolean) {
	occupied = newOccupied;
}

function IsPlayerInSpawn () : boolean {
	return playerInSpawn;
}