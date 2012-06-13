//The maximum snowballs a resource can have.
var maxSnowballs : int;
//The time it needs to refill one ball in the resource.
var restockTime : float;
private var currentRestockTime : float; 

//The variable containing a big Snowball prefab.
var bigSnowballPrefab : GameObject;

//The amount a big snowball represents.
var bigSnowballAmount : int;
//The current snowballs of a resource.
private var currentSnowballs : int;

private var snowballRessource : Transform;
private var creationTime : float = 0.0;
var activationTimeout : float = 5.0;

function Start () {
	currentSnowballs = maxSnowballs;
	
	GetComponent(Collider).isTrigger = true;
	
	snowballRessource = transform.Find("SnowballRessource");
	var renderer : MeshRenderer = snowballRessource.GetComponent(MeshRenderer);
	renderer.material.color = Color.green;

}

function Update () {	
	
	//Scaling issues.
	Rescale ();
	
	currentRestockTime += Time.deltaTime;
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

function Rescale () {
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
}

//This function will be called when a player want to create a big snowball.
function GrabBigSnowball(playerPos : Vector3) {
	currentSnowballs -= bigSnowballAmount;
	//var bigSnowballSpawn = transform.FindChild("BigSnowballSpawn");
	//Debug.Log(bigSnowballSpawn.position);
	var spawnPos = transform.position;
	spawnPos.x += (transform.position.x-playerPos.x);
	spawnPos.z += (transform.position.z-playerPos.z);
	spawnPos.y += 5;
	Instantiate(bigSnowballPrefab, spawnPos, Quaternion.identity);
	//bigSnowballPrefab.GetComponent(BigSnowBall).Respawn(spawnPos);
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
	//Debug.Log("triggering " + Time.time, this);
	//Wait a while, when ressource is created, before it is active
	if (Time.time < creationTime + activationTimeout)
		return;

	if (other.CompareTag("Player") || other.CompareTag("Bot")) {
		if (IsGrabPossible()) {
			var playerStatus : PlayerStatus = other.transform.GetComponent(PlayerStatus);
			if (playerStatus.CollectSnowPossible()) {
				Grab();
				playerStatus.CollectSnow();				
			}
		}
		if (IsGrabBigSnowballPossible() && other.CompareTag("Player") && Input.GetMouseButtonDown(1)) {
			GrabBigSnowball(other.transform.position);
		}
	}
}

function CreateResourceFromSnowball(ballSize : float, maxBallSize : float) {
	creationTime = Time.time;
	currentSnowballs = Mathf.Min(Mathf.Round(maxSnowballs * ballSize/maxBallSize), maxSnowballs);
	
	//Do some other important stuff	
	snowballRessource = transform.Find("SnowballRessource");
	GetComponent(Collider).isTrigger = true;
	Rescale ();
}