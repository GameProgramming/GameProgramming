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

function Start () {
	currentSnowballs = maxSnowballs;
	snowballRessource = transform.Find("SnowballRessource");
//	var renderer : MeshRenderer = snowballRessource.GetComponent(MeshRenderer);
//	renderer.material.color = Color.green;

}

function Update () {	
	currentRestockTime += Time.deltaTime;
	
	snowballRessource.localPosition = Vector3(0, currentSnowballs*0.01-2, 0);

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
	return (currentSnowballs >= bigSnowballAmount);
}

function OnTriggerStay(other : Collider) {
	if (other.CompareTag("Player") || other.CompareTag("Bot")) {
		if (IsGrabPossible()) {
			var playerStatus : PlayerStatus = other.transform.GetComponent(PlayerStatus);
			other.transform.GetComponent(ItemManager).SetSnowfieldCandidate(gameObject);
			if (playerStatus.CollectSnowPossible()) {
				Grab();
				playerStatus.CollectSnow();
			}
		}
	}
}

function FromBallSizeToSnowballs(ballSize : float, maxBallSize : float) {
	currentSnowballs = Mathf.Min(Mathf.Round(maxSnowballs * ballSize/maxBallSize), maxSnowballs);	
}