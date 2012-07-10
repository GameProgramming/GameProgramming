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
var currentSnowballs : int = 0;

private var snowballRessource : Transform;
private var creationTime : float = 0.0;
var activationTimeout : float = 5.0;

private var snowRestockingRound :int = 0;
private var snowAmountManager :SnowAmountManager;

function Awake () {
	snowAmountManager = GameObject.FindGameObjectWithTag("Game").GetComponent(SnowAmountManager);
}

function Start () {
	snowRestockingRound = snowAmountManager.GetDistributionRound();
	
	GetComponent(Collider).isTrigger = true;
	
	snowballRessource = transform.Find("SnowballRessource");
	
	transform.position.y = Terrain.activeTerrain.SampleHeight(transform.position) + 0.8;

//	var renderer : MeshRenderer = snowballRessource.GetComponent(MeshRenderer);
//	renderer.material.color = Color.green;

}

function Update () {	
	
	snowballRessource.localPosition = Vector3(0, currentSnowballs*0.01-2, 0);
	
	currentRestockTime += Time.deltaTime;

	if (currentRestockTime >= restockTime) {
		if (snowAmountManager.GetDistributionRound() > snowRestockingRound) {
			Restock();
			currentRestockTime = 0.0;
			snowRestockingRound = snowAmountManager.GetDistributionRound();
		}
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
function GrabBigSnowball(player : GameObject) :GameObject {
	if (Network.isServer) {
		currentSnowballs -= bigSnowballAmount;
		var spawnPos :Vector3 = player.transform.position + player.transform.forward;
		var bigSnowball :GameObject = Network.Instantiate(bigSnowballPrefab, spawnPos, Quaternion.identity, 0);
		Debug.Log("[NetServer] Create Big Snowball " + bigSnowball.networkView.viewID);
		return bigSnowball;
	} else {
		Debug.LogWarning("[NetClient] Only the server may create new big snowballs");
		return null;
	}
}

//We need to restore all balls when restarting the level.
//function Restart() {
//	currentSnowballs = maxSnowballs;
//}

//Should be called before grabbing.
function IsGrabPossible() : boolean {
	return (currentSnowballs > 0);
}

//Should be called before grabbing bigSnowball.
function IsGrabBigSnowballPossible() : boolean {
	return (currentSnowballs >= bigSnowballAmount);
}

function GetCurrentSnowballs() :int {
	return currentSnowballs;
}


function OnTriggerStay(other : Collider) {
	//Debug.Log("triggering " + Time.time, this);
	//Wait a while, when ressource is created, before it is active
	if (Time.time < creationTime + activationTimeout)
		return;

	if (other.CompareTag("Player")) {
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

function CreateResourceFromSnowball(ballSize : float) {
	creationTime = Time.time;
	currentSnowballs = Mathf.Min(Mathf.Round(ballSize), maxSnowballs);
	snowballRessource = transform.Find("SnowballRessource");
	GetComponent(Collider).isTrigger = true;
}

function OnSerializeNetworkView(stream :BitStream, info :NetworkMessageInfo) {
    stream.Serialize(currentSnowballs);
}