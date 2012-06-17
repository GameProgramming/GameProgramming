#pragma strict
private var motor : CharacterMotorSF;
private var pStatus : PlayerStatus;

@System.NonSerialized
var inputAction : boolean = false;
@System.NonSerialized
var lastInputAction : boolean = false;
@System.NonSerialized
var inputAltFire : boolean = false;

private var item : GameObject;
private var candidateItem : GameObject;
private var movementOffset : Vector3;
var maxCandidateDistance : float = 1.0;

private var snowResourcePick :SnowRessource; // typo im typnamen, ach mensch...
private var srPickProgress : float = 0;
var srPickTime : float = 3;

function Start () {
	motor = GetComponent(CharacterMotorSF);
	pStatus = GetComponent(PlayerStatus);
	item = null;
	snowResourcePick = null;
}

function Update () {
	if (candidateItem && CandidateTooFarAway()) {
		candidateItem = null;
	}
	var inputActionUp = !lastInputAction && inputAction;
	lastInputAction = inputAction;
	
	if (snowResourcePick) {
		if (snowResourcePick.IsGrabBigSnowballPossible() 
				&& inputAction && !pStatus.IsDead()) {
			srPickProgress += Time.deltaTime;
			Debug.Log("Building ball " + srPickProgress, this);
			
			if (srPickProgress > srPickTime) {
				Debug.Log("Ball built", this);
				item = snowResourcePick.GrabBigSnowball(gameObject);
				snowResourcePick = null;
				srPickProgress = 0;
				item.SendMessage("PickItem", gameObject, SendMessageOptions.DontRequireReceiver);
			}
		} else {
			srPickProgress = 0;
			snowResourcePick = null;
		}
	} else if (item && (inputActionUp || pStatus.IsDead())) {
		item.SendMessage("Release", null, SendMessageOptions.DontRequireReceiver);
		ReleaseItem();
	//} else if (!item && inputActionUp && candidateItem && ItemNotHeld(candidateItem)
	} else if (!item && inputAction && candidateItem && ItemNotHeld(candidateItem)
			  && motor.IsGrounded()) {
		if (candidateItem.CompareTag("SnowballRessource")) {
			snowResourcePick = candidateItem.GetComponent(SnowRessource);
			srPickProgress = 0;
		} else {
			item = candidateItem;
			if (item.layer != LayerMask.NameToLayer("Item")
				&& item.transform.parent.gameObject.layer == LayerMask.NameToLayer("Item")) {
				item = item.transform.parent.gameObject;
			}
			item.SendMessage("PickItem", gameObject, SendMessageOptions.DontRequireReceiver);
		}
	}
}

function OnControllerColliderHit (hit : ControllerColliderHit) {
	if (hit.gameObject.layer == LayerMask.NameToLayer("Item")) {
		candidateItem = hit.gameObject;
	} else if (hit.transform.parent
			&& hit.transform.parent.gameObject.layer == LayerMask.NameToLayer("Item")) {
		candidateItem = hit.gameObject;
	}
}

function PassOnMovementOffset (offset : Vector3) {

	if (item) 
		item.SendMessage("Move", offset, SendMessageOptions.DontRequireReceiver);
}

function ReleaseItem () {
	if(item) {
		if (item.CompareTag("BigSnowball"))
			item.transform.parent = null;
		item = null;
		candidateItem = null;
	}
}

function OnItemDestruction ( destructedItem : GameObject) {
	if (destructedItem == item) {
		item = null;
	}
}

function CandidateTooFarAway() {
	var totalDistance = GetComponent(CharacterController).radius
			+ candidateItem.collider.bounds.size.x + maxCandidateDistance;
	if (Vector3.Distance(candidateItem.transform.position, transform.position) > totalDistance) {
		candidateItem = null;
		item = null;
		return true;
	}
	else
		return false;
}

//Check if another player might already hold the item
function ItemNotHeld(it : GameObject) : boolean {
	if (it.CompareTag("BigSnowball") && it.transform.parent)
		return false;
	else 
		return true;
}

function GetItem () {
	return item;
}

function SetSnowfieldCandidate(sf :GameObject) {
	if (!candidateItem) {
		candidateItem = sf;
	}
}

@script RequireComponent (CharacterMotorSF)