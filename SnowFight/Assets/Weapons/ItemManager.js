#pragma strict
#pragma downcast
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

private var showItemGUI : boolean = true;
var itemGUIStyle : GUIStyle;
var itemGUITime : float = 0.0;

private var snowResourcePick :SnowRessource; // typo im typnamen, ach mensch...
private var srPickProgress : float = 0;
var srPickTime : float = 3;

function Start () {
	motor = GetComponent(CharacterMotorSF);
	pStatus = GetComponent(PlayerStatus);
	item = null;
	snowResourcePick = null;
}

function OnGUI () {
	var status : PlayerStatus = transform.GetComponent(PlayerStatus);
	if (status.IsMainPlayer() && showItemGUI) {
		if (item != null) {
				itemGUITime += Time.deltaTime;
			if (item.CompareTag("Ufo") && itemGUITime <= 5.0) {
				GUI.Label (Rect (Screen.width/2 - 100, Screen.height-80, 200, 20), "Left click to shoot.", itemGUIStyle);
				GUI.Label (Rect (Screen.width/2 - 150, Screen.height-60, 300, 20), "Right click to freeze enemies.", itemGUIStyle);
			} else if (item.CompareTag("BigSnowball") && itemGUITime <= 5.0) {
				GUI.Label (Rect (Screen.width/2 - 200, Screen.height-60, 400, 20), "Right click to create a Snow Ressource.", itemGUIStyle);
			} else if (item.CompareTag("Weapon") && itemGUITime <= 5.0) {
				GUI.Label (Rect (Screen.width/2 - 100, Screen.height-60, 200, 20), "Left click to shoot.", itemGUIStyle);
			}
		} else {
			itemGUITime = 0.0;
			if (candidateItem) {
				if (candidateItem.CompareTag("BigSnowball") && item == null) {
					GUI.Label (Rect (Screen.width/2 - 150, Screen.height-60, 300, 20), "Press E to move big Snowball.", itemGUIStyle);
				//} else if (candidateItem.layer != LayerMask.NameToLayer("Item") &&
			    	//candidateItem.transform.parent.gameObject.layer == LayerMask.NameToLayer("Item")) {
					//GUI.Label (Rect (Screen.width/2 - 150, Screen.height/2, 300, 20), "Press E to get in the UFO.", itemGUIStyle);
				} else if (candidateItem.CompareTag("Weapon") && item == null) {
					GUI.Label (Rect (Screen.width/2 - 150, Screen.height-60, 300, 20), "Press E to use Snow Rocket.", itemGUIStyle);
				} else if (candidateItem.CompareTag("SnowballRessource") && item == null) {
					GUI.Label (Rect (Screen.width/2 - 150, Screen.height-60, 300, 20), "Hold E to create a big Snowball.", itemGUIStyle);
				}
			}
		}
		var texture : Texture2D = new Texture2D(1, 1);
		var style = new GUIStyle();
		var boxWidth : float = (Screen.width/8 + 10);
		var finalBoxWidth;
		var color;
		var text;
	
		var srPercent : float = srPickProgress / srPickTime;
		if (srPercent < 0.0) {
			srPercent = 0.0;
		}
		if (srPercent == 0.0) {
			color = new Color(1, 0, 0,0.5);
			finalBoxWidth = boxWidth;
		} else {
			color = new Color(1-srPercent, srPercent, 0,0.5);
			finalBoxWidth = srPercent * boxWidth;
		}
	
		var boxHeight = 19;
		texture.SetPixel(0, 0, color);
		texture.Apply();
		style.normal.background = texture;
	
		if (srPercent > 0.0) {
			GUI.Box (Rect (Screen.width / 2 - boxWidth/2-1, Screen.height - 25, (Screen.width/8 + 12), boxHeight+2), "");
			GUI.Box (Rect (Screen.width / 2 - boxWidth/2, Screen.height - 24, finalBoxWidth, boxHeight), "", style);
		}
	}
}

function Update () {
	if (!networkView.isMine) return;
	
	if (candidateItem && (CandidateTooFarAway() || item == candidateItem)) {
		candidateItem = null;
	}
	var inputActionUp = !lastInputAction && inputAction;
	lastInputAction = inputAction;
	
	if (snowResourcePick) {
		if (snowResourcePick.IsGrabBigSnowballPossible() 
				&& inputAction && !pStatus.IsDead()) {
			srPickProgress += Time.deltaTime;

			if (srPickProgress > srPickTime) {
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
	} else if (!item && inputActionUp && candidateItem && ItemNotHeld(candidateItem) ) {
//	} else if (!item && inputAction && candidateItem && ItemNotHeld(candidateItem) && motor.IsGrounded()
		if (candidateItem.CompareTag("SnowballRessource")) {
			snowResourcePick = candidateItem.GetComponent(SnowRessource);
			srPickProgress = 0;
		} else {
			if (candidateItem.layer != LayerMask.NameToLayer("Item") // ufo hack
				&& candidateItem.transform.parent.gameObject.layer == LayerMask.NameToLayer("Item")) {
				var status : PlayerStatus = transform.GetComponent(PlayerStatus);
				if (status.IsMainPlayer()) {
					var playerHealth : PlayerHealthBar = transform.GetComponent(PlayerHealthBar);
					var snowballBarPlayer : SnowballBar = transform.GetComponent(SnowballBar);
					playerHealth.SetInUFO(true);
					snowballBarPlayer.SetInUFO(true);
				}
				SetItem(candidateItem.transform.parent.gameObject);
			} else {
				SetItem(candidateItem);
			}
		}
	}
}

function SetItem( it :GameObject ) {
	if (it == item) {
		Debug.Log ("Prevented the re-setting of the same item for "+pStatus.playerName);
		return;
	}
	item = it;
	candidateItem = null;
	if (pStatus.IsMainPlayer()) Debug.Log("Player picked up "+item);
	SendMessage("OnItemChange", this, SendMessageOptions.DontRequireReceiver);
	item.SendMessage("PickItem", gameObject, SendMessageOptions.DontRequireReceiver);
	Debug.Log("Set item " + item.tag, this);
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
	if (item) {
		item.SendMessage("Move", offset, SendMessageOptions.DontRequireReceiver);
	}
}

function ReleaseItem () {
	if(item) {
		item.SendMessage("Release", SendMessageOptions.DontRequireReceiver);
		
		var status : PlayerStatus = transform.GetComponent(PlayerStatus);
		if (item.CompareTag("Ufo") && status.IsMainPlayer()) {
			var playerHealth : PlayerHealthBar = transform.GetComponent(PlayerHealthBar);
			var snowballBarPlayer : SnowballBar = transform.GetComponent(SnowballBar);
			playerHealth.SetInUFO(false);
			snowballBarPlayer.SetInUFO(false);
		}
		if (item.CompareTag("BigSnowball")) {
			item.transform.parent = null;
		}
		if (pStatus.IsMainPlayer()) Debug.Log("Player released "+item);
		
		item = null;
		candidateItem = null;
		SendMessage("OnItemChange", this, SendMessageOptions.DontRequireReceiver);
	}
}

function OnItemDestruction ( destructedItem : GameObject) {
	if (destructedItem == item) {
		ReleaseItem();
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
	return (it.CompareTag("BigSnowball") 
		|| !it.transform.parent
		|| !it.transform.parent.CompareTag("Player"));
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

function GetShowItemGUI () : boolean {
	return showItemGUI;
}

@script RequireComponent (CharacterMotorSF)
@script RequireComponent (NetworkView)