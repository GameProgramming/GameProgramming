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

private var ballCreationTime : float = 0.0;

function Start () {
	currentSnowballs = maxSnowballs;
	
	GetComponent(Collider).isTrigger = true;
	
	snowballRessource = transform.Find("SnowballRessource");
//	var renderer : MeshRenderer = snowballRessource.GetComponent(MeshRenderer);
//	renderer.material.color = Color.green;

}

function Update () {	
	
	snowballRessource.localPosition = Vector3(0, currentSnowballs*0.01-2, 0);
	
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

//This function will be called when a player want to create a big snowball.
function GrabBigSnowball(playerPos : Vector3) :GameObject {
	ballCreationTime = Time.time;
	currentSnowballs -= bigSnowballAmount;
	//var bigSnowballSpawn = transform.FindChild("BigSnowballSpawn");
	//Debug.Log(bigSnowballSpawn.position);
	var spawnPos = transform.position;
	spawnPos.x += (transform.position.x-playerPos.x);
	spawnPos.z += (transform.position.z-playerPos.z);
	spawnPos.y += 5;
	return Instantiate(bigSnowballPrefab, spawnPos, Quaternion.identity);
	//bigSnowballPrefab.GetComponent(BigSnowBall).Respawn(spawnPos);
}

//We need to restore all balls when restarting the level.
function Restart() {
	currentSnowballs = maxSnowballs;
}

//Should be called before grabbing.
function IsGrabPossible() : boolean {
	return (currentSnowballs > 0);
}

//Should be called before grabbing bigSnowball.
function IsGrabBigSnowballPossible() : boolean {
	Debug.Log("Attempt to create" + Time.time, this);
//	if (Time.time < ballCreationTime + activationTimeout)
//		Debug.Log("Can't create " + Time.time, this);
//	return (Time.time > ballCreationTime + activationTimeout && currentSnowballs >= bigSnowballAmount);
	return currentSnowballs >= bigSnowballAmount;
}

function OnTriggerStay(other : Collider) {
	//Debug.Log("triggering " + Time.time, this);
	//Wait a while, when ressource is created, before it is active
	if (Time.time < creationTime + activationTimeout)
		return;
	var playerStatus : PlayerStatus;
	var playerMotor : CharacterMotorSF;
	
	if (other.CompareTag("Player") || other.CompareTag("Bot")) {
		playerStatus = other.transform.GetComponent(PlayerStatus);
		playerMotor = other.gameObject.GetComponent(CharacterMotorSF);
		if (IsGrabPossible()) {
			//other.transform.GetComponent(ItemManager).SetSnowfieldCandidate(gameObject);
			if (playerStatus.CollectSnowPossible()) {
				Grab();
				playerStatus.CollectSnow();
			}
		}
		
//		var playerStatus = other.gameObject.GetComponen(PlayerStatus);
		if(playerMotor.inputAction && !playerStatus.IsDead() && IsGrabBigSnowballPossible()) {
				Debug.Log("Grab big snowball " + Time.time, this);
				GrabBigSnowball(transform.position);
		}
	}
}

function CreateResourceFromSnowball(ballSize : float, maxBallSize : float) {
	creationTime = Time.time;
	currentSnowballs = Mathf.Min(Mathf.Round(maxSnowballs * ballSize/maxBallSize), maxSnowballs);
	
	//Do some other important stuff	
	snowballRessource = transform.Find("SnowballRessource");
	GetComponent(Collider).isTrigger = true;
}