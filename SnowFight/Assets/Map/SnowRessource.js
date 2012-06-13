//The maximum snowballs a resource can have.
var maxSnowballs : int;
//The time it needs to refill one ball in the resource.
var restockTime : float;
private var currentRestockTime : float; 

//The variable containing a big Snowball prefab.
var bigSnowball : Rigidbody;

//The amount a big snowball represents.
var bigSnowballAmount : int;
//The current snowballs of a resource.
private var currentSnowballs = 0;

function Start () {
	currentSnowballs = maxSnowballs;
}

function Update () {	
	currentRestockTime += Time.deltaTime;
	//Scaling issues.
	if (currentSnowballs >= 80) {
		transform.localScale = Vector3(0.8, 0.8, 0.8);
	} else if (currentSnowballs >= 60) {
		transform.localScale = Vector3(0.6, 0.6, 0.6);
	} else if (currentSnowballs >= 40) {
		transform.localScale = Vector3(0.4, 0.4, 0.4);
	} else if (currentSnowballs >= 20) {
		transform.localScale = Vector3(0.2, 0.2, 0.2);
	} else if (currentSnowballs >= 0) {
		transform.localScale = Vector3(0.01, 0.01, 0.01);
	}
	//Restock every 3 seconds.
	if (currentRestockTime >= restockTime) {
		Restock();
		currentRestockTime = 0.0;
	}
}

//This function will be called when a player grabs a snowball.
function Grab() {
	if (currentSnowballs > 0) {
		currentSnowballs -= 1;
	}
	
}

//Restock every few seconds the snowballresource.
function Restock() {
	if (currentSnowballs < 100) {
		currentSnowballs += 1;
	}
	
}

//This function will be called when a player want to create a big snowball.
function GrabBigSnowball() {
	if (currentSnowballs >= 10) {
		currentSnowballs -= bigSnowballAmount;
		var bigSnowballSpawn = transform.FindChild("BigSnowballSpawn");
		Instantiate(bigSnowball, bigSnowballSpawn.position, bigSnowballSpawn.rotation);
	}
	

}

//We need to restore all balls when restarting the level.
function Restart() {
	currentSnowballs = maxSnowballs;
}

//Should be called before grabbing.
function IsGrabPossible() : boolean {
	if (currentSnowballs > 0) {
		return true;
	}
	return false;
}

//Should be called before grabbing.
function IsGrabBigSnowballPossible() : boolean {
	if (currentSnowballs >= 10) {
		return true;
	}
	return false;
}

function OnTriggerEnter(other : Collider) {
	if (other.CompareTag("Player") || other.CompareTag("Bot")) {
		if (IsGrabPossible()) {
			var playerStatus : PlayerStatus = other.transform.GetComponent(PlayerStatus);
			if (playerStatus.RestockPossible()) {
				playerStatus.Restock();
				Grab();
			}
			
		}
	}
}