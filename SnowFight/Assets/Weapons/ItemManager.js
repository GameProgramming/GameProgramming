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
	if (!networkView.isMine) return;
	
	if (candidateItem && CandidateTooFarAway()) {
		candidateItem = null;
	}
	var inputActionUp = !lastInputAction && inputAction;
	lastInputAction = inputAction;
	
	if (snowResourcePick) {
		if (snowResourcePick.IsGrabBigSnowballPossible() 
				&& inputAction && !pStatus.IsDead()) {
			srPickProgress += Time.deltaTime;
//			Debug.Log("Building ball " + srPickProgress, this);
			
			if (srPickProgress > srPickTime) {
				Debug.Log("Ball built", this);
				SetItem(snowResourcePick.GrabBigSnowball(gameObject));
				snowResourcePick = null;
				srPickProgress = 0;
			}
		} else {
			srPickProgress = 0;
			snowResourcePick = null;
		}
	} else if (item && (inputActionUp || pStatus.IsDead())) {
//  } else if (item && (inputAction || pStatus.IsDead())) {
		ReleaseItem();
	} else if (!item && inputActionUp && candidateItem && ItemNotHeld(candidateItem)
//	} else if (!item && inputAction && candidateItem && ItemNotHeld(candidateItem)
			  && motor.IsGrounded()) {
		if (candidateItem.CompareTag("SnowballRessource")) {
			snowResourcePick = candidateItem.GetComponent(SnowRessource);
			srPickProgress = 0;
		} else {
			if (candidateItem.layer != LayerMask.NameToLayer("Item") // ufo hack
				&& candidateItem.transform.parent.gameObject.layer == LayerMask.NameToLayer("Item")) {
				SetItem(candidateItem.transform.parent.gameObject);
			} else {
				SetItem(candidateItem);
			}
		}
	}
}

function SetItem( it :GameObject ) {
	item = it;
	candidateItem = null;
	if (pStatus.IsMainPlayer()) Debug.Log("Player picked up "+item);
	SendMessage("OnItemChange", this, SendMessageOptions.DontRequireReceiver);
	item.SendMessage("PickItem", gameObject, SendMessageOptions.DontRequireReceiver);
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
		item.SendMessage("Release", SendMessageOptions.DontRequireReceiver);
		if (item.CompareTag("BigSnowball"))
			item.transform.parent = null;
		if (pStatus.IsMainPlayer()) Debug.Log("Player released "+item);
		item = null;
		candidateItem = null;
		SendMessage("OnItemChange", this, SendMessageOptions.DontRequireReceiver);
	}
}

function OnItemDestruction ( destructedItem : GameObject) {
	if (destructedItem == item) {
		ReleaseItem();
//		item = null;
//		candidateItem = null;
//		SendMessage("OnItemChange", this, SendMessageOptions.DontRequireReceiver);
	}
}

function CandidateTooFarAway() {
	var totalDistance = GetComponent(CharacterController).radius
			+ candidateItem.collider.bounds.size.x + maxCandidateDistance;
	if (Vector3.Distance(candidateItem.transform.position, transform.position) > totalDistance) {
		candidateItem = null;
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

function GetItem () : GameObject {
	return item;
}

function SetSnowfieldCandidate(sf :GameObject) {
	if (!candidateItem) {
		candidateItem = sf;
	}
}

function OnSerializeNetworkView(stream :BitStream, info :NetworkMessageInfo) {
	var itemMyId :NetworkViewID = NetworkViewID.unassigned;
	if (item) {
		itemMyId = item.networkView.viewID;
	}
	var itemId :NetworkViewID = itemMyId;
    stream.Serialize(itemId);
    if (itemId != itemMyId) {
    	if (itemId != NetworkViewID.unassigned) {
    		var it :NetworkView = NetworkView.Find(itemId);
    		if (it) {
    			SetItem(it.gameObject);
    		} else {
    			Debug.Log("Received an item signal for an unknown itm. Id="+itemId);
    		}
    	} else {
    		ReleaseItem();
    	}
    }
}

function GetCandidateItem() : GameObject {
	return candidateItem;
}

@script RequireComponent (CharacterMotorSF)
@script RequireComponent (NetworkView)