#pragma strict
private var motor : CharacterMotorSF;
private var pStatus : PlayerStatus;

@System.NonSerialized
var inputAction : boolean = false;
@System.NonSerialized
var inputAltFire : boolean = false;

private var item : GameObject;
private var candidateItem : GameObject;
private var movementOffset : Vector3;
var maxCandidateDistance : float = 1.0;

function Start () {
	motor = GetComponent(CharacterMotorSF);
	pStatus = GetComponent(PlayerStatus);
	item = null;
}

function Update () {
	//player releases action button or dies
	if (item && (inputAction || pStatus.IsDead())) {
		item.SendMessage("Release", null, SendMessageOptions.DontRequireReceiver);
		ReleaseItem();
	}

	else if (!item && inputAction && candidateItem && ItemNotHeld(candidateItem) && !CandidateTooFarAway() && motor.IsGrounded()) {
		item = candidateItem;
		if (item.layer != LayerMask.NameToLayer("Item")
			&& item.transform.parent.gameObject.layer == LayerMask.NameToLayer("Item")) {
			item = item.transform.parent.gameObject;
		}
		item.SendMessage("PickItem", gameObject, SendMessageOptions.DontRequireReceiver);
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
		inputAction = false;
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

@script RequireComponent (CharacterMotorSF)