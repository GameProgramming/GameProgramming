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
var itemGUIStyle2 : GUIStyle;
var itemGUITime : float = 0.0;

private var snowResourcePick :SnowRessource; // typo im typnamen, ach mensch...
private var srPickProgress : float = 0;
var srPickTime : float = 3;

function Start () {
	motor = GetComponent(CharacterMotorSF);
	pStatus = GetComponent(PlayerStatus);
	item = null;
	snowResourcePick = null;
	itemGUIStyle.clipping = TextClipping.Overflow;
	itemGUIStyle2.clipping = TextClipping.Overflow;
}

function OnGUI () {
	var status : PlayerStatus = transform.GetComponent(PlayerStatus);
	var textForToolTip : String;
	var textForToolTip2 : String;
	if (status.IsMainPlayer() && showItemGUI) {
		if (item != null) {
				itemGUITime += Time.deltaTime;
			if (item.CompareTag("Ufo")) {
				textForToolTip = "Left click to shoot.";
				textForToolTip2 = "Right click to freeze enemies.";
			} else if (item.CompareTag("BigSnowball")) {
				textForToolTip = "Right click to create a snow ressource..";
			} else if (item.CompareTag("Weapon")) {
				textForToolTip = "Left click to shoot.";
			}

			if (textForToolTip2 != null) {
				GUI.Label (Rect (Screen.width/2 - 100, Screen.height-79, 200, 20), textForToolTip, itemGUIStyle2);
				GUI.Label (Rect (Screen.width/2 - 100, Screen.height-80, 200, 20), textForToolTip, itemGUIStyle);
				GUI.Label (Rect (Screen.width/2 - 100, Screen.height-59, 200, 20), textForToolTip2, itemGUIStyle2);
				GUI.Label (Rect (Screen.width/2 - 100, Screen.height-60, 200, 20), textForToolTip2, itemGUIStyle);
			} else {
				GUI.Label (Rect (Screen.width/2 - 100, Screen.height-59, 200, 20), textForToolTip, itemGUIStyle2);
				GUI.Label (Rect (Screen.width/2 - 100, Screen.height-60, 200, 20), textForToolTip, itemGUIStyle);
			}

		} else {
			itemGUITime = 0.0;
			if (candidateItem) {
				if (candidateItem.CompareTag("BigSnowball") && item == null) {
					textForToolTip = "Press E to move big Snowball.";
				} else if (candidateItem.CompareTag("Weapon") && item == null) {
					textForToolTip = "Press E to use Snow Rocket.";
				} else if (candidateItem.CompareTag("SnowballRessource") && item == null) {
					textForToolTip = "Hold E to create a big Snowball.";		
				} else if (candidateItem.layer != LayerMask.NameToLayer("Item")) {
					if (candidateItem.transform.parent != null) {
						if (candidateItem.transform.parent.gameObject.layer == LayerMask.NameToLayer("Item")) {
							textForToolTip = "Press E to get in the UFO.";
						}
					}
				}
				GUI.Label (Rect (Screen.width/2 - 100, Screen.height-59, 200, 20), textForToolTip, itemGUIStyle2);
				GUI.Label (Rect (Screen.width/2 - 100, Screen.height-60, 200, 20), textForToolTip, itemGUIStyle);
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

@RPC
function NetGrabSnowball (snowResourceId :NetworkViewID, info :NetworkMessageInfo) {
	var snowResource :NetworkView = NetworkView.Find(snowResourceId);
	if (!snowResource) {
		Debug.Log("Received [NetGrabSnowball] for an unknown network view. ID: " + snowResourceId);
		return;
	}
	var snowRes :SnowRessource = snowResource.GetComponent(SnowRessource);
	if (!snowRes) {
		Debug.Log("Received [NetGrabSnowball] for an object that is no SnowResource. ID: " + snowResource);
		return;
	}
	var newItem :GameObject = snowRes.GrabBigSnowball(gameObject);
	networkView.RPC("NetGrabSnowballCallback", info.sender, newItem.networkView.viewID);
}

@RPC
function NetGrabSnowballCallback (snowballId :NetworkViewID) {
	var snowballV :NetworkView = NetworkView.Find(snowballId);
	if (!snowballV) yield; // wait....
	snowballV = NetworkView.Find(snowballId);
	if (!snowballV) {
		Debug.Log("Received [NetGrabSnowballCallback] for a not existing ball. ID: " + snowballId);
		return;
	}
	SetItem(snowballV.gameObject);
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
				if (Network.isServer) {
					SetItem(snowResourcePick.GrabBigSnowball(gameObject));
				} else {
					networkView.RPC("NetGrabSnowball", RPCMode.Server, snowResourcePick.networkView.viewID);
				}
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