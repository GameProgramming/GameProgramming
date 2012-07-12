#pragma strict
#pragma downcast
private var motor : CharacterMotorSF;
private var pStatus : PlayerStatus;
private var game :GameStatus;
private var tooltip :Tooltip;

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

var itemLogoUfo :Texture;
var itemLogoSnowball :Texture;
var itemLogoRockets :Texture;

function Start () {
	motor = GetComponent(CharacterMotorSF);
	pStatus = GetComponent(PlayerStatus);
	item = null;
	snowResourcePick = null;
	itemGUIStyle.clipping = TextClipping.Overflow;
	itemGUIStyle2.clipping = TextClipping.Overflow;
	game = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus);
	tooltip = game.GetComponent(Tooltip);
}

function OnGUI () {
	var status : PlayerStatus = transform.GetComponent(PlayerStatus);
	var textForToolTip : String;
	var textForToolTip2 : String;
	if (status.IsMainPlayer() && showItemGUI) {
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
		Debug.LogWarning("Received [NetGrabSnowball] for an unknown network view. ID: " + snowResourceId);
		return;
	}
	var snowRes :SnowRessource = snowResource.GetComponent(SnowRessource);
	if (!snowRes) {
		Debug.LogWarning("Received [NetGrabSnowball] for an object that is no SnowResource. ID: " + snowResource);
		return;
	}
	var newItem :GameObject = snowRes.GrabBigSnowball(gameObject);
	networkView.RPC("NetGrabSnowballCallback", info.sender, newItem.networkView.viewID);
}

@RPC
function NetGrabSnowballCallback (snowballId :NetworkViewID) {
	var snowballV :NetworkView = NetworkView.Find(snowballId);
	if (!snowballV) yield WaitForSeconds(0.02); // wait....
	snowballV = NetworkView.Find(snowballId);
	if (!snowballV) {
		Debug.Log("Received [NetGrabSnowballCallback] for a non existing ball. ID: " + snowballId);
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
		ReleaseItem();
	} else if (!item && inputActionUp && candidateItem && ItemNotHeld(candidateItem) ) {
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
	
	if (pStatus.IsMainPlayer() && !pStatus.IsDead()) {
		if (item) {
			if (item.CompareTag("Ufo")) {
				tooltip.SetTooltip("Cannon", "Freezing Ray", "Exit", itemLogoUfo);
			} else if (item.CompareTag("BigSnowball")) {
				tooltip.SetTooltip("Push", "Create Snow Resource", "Drop", itemLogoSnowball);
			} else if (item.CompareTag("Weapon")) {
				tooltip.SetTooltip("Fire Rocket", "", "Drop", itemLogoRockets);
			}
		} else {
			if (!candidateItem) {
				tooltip.SetTooltip("", "", "", null);
			} else if (candidateItem.CompareTag("BigSnowball")) {
				tooltip.SetTooltip("", "", "Pick up", itemLogoSnowball);
			} else if (candidateItem.CompareTag("Weapon")) {
				tooltip.SetTooltip("", "", "Pick up", itemLogoRockets);
			} else if (candidateItem.CompareTag("SnowballRessource")) {
				tooltip.SetTooltip("", "", "Create Snowball", itemLogoSnowball);
			} else if (candidateItem.CompareTag("UfoBody")) {
				tooltip.SetTooltip("", "", "Jump in", itemLogoUfo);
			} else {
				tooltip.SetTooltip("", "", "", null);
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
	return (false//it.CompareTag("BigSnowball") 
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