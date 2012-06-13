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
private var currentSnowballs : int;

private var snowballRessource : Transform;

function Start () {
	currentSnowballs = maxSnowballs;
	snowballRessource = transform.Find("SnowballRessource");
	var renderer : MeshRenderer = snowballRessource.GetComponent(MeshRenderer);
	renderer.material.color = Color.white;

}

function Update () {	
	currentRestockTime += Time.deltaTime;
	
	//Scaling issues.
	if (currentSnowballs >= 80) {
		snowballRessource.localScale = Vector3(0.2, 10, 0.2);
		snowballRessource.localPosition.y = 5;
	} else if (currentSnowballs >= 60) {
		snowballRessource.localScale = Vector3(0.2, 8, 0.2);
		snowballRessource.localPosition.y = 4;
	} else if (currentSnowballs >= 40) {
		snowballRessource.localScale = Vector3(0.2, 6, 0.2);
		snowballRessource.localPosition.y = 3;
	} else if (currentSnowballs >= 20) {
		snowballRessource.localScale = Vector3(0.2, 4, 0.2);
		snowballRessource.localPosition.y = 2;
	} else if (currentSnowballs > 0) {
		snowballRessource.localScale = Vector3(0.2, 2, 0.2);
		snowballRessource.localPosition.y = 1;
	} else if (currentSnowballs == 0) {
		snowballRessource.localScale = Vector3(0.01, 0.01, 0.01);
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
	currentSnowballs -= bigSnowballAmount;
	var bigSnowballSpawn = transform.FindChild("BigSnowballSpawn");
	var bigSnowball : Rigidbody;
	bigSnowball = Instantiate(bigSnowball, bigSnowballSpawn.position, bigSnowballSpawn.rotation);
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

//Should be called before grabbing bigSnowball.
function IsGrabBigSnowballPossible() : boolean {
	if (currentSnowballs >= bigSnowballAmount) {
		return true;
	}
	return false;
}

function OnTriggerStay(other : Collider) {
	if (other.CompareTag("Player") || other.CompareTag("Bot")) {
		if (IsGrabPossible()) {
			var playerStatus : PlayerStatus = other.transform.GetComponent(PlayerStatus);
			if (playerStatus.CollectSnowPossible()) {
				Grab();
				playerStatus.CollectSnow();				
			}
		}
		if (IsGrabBigSnowballPossible() && other.CompareTag("Player") && Input.GetMouseButtonDown(1)) {
			GrabBigSnowball();
		}
	}
}