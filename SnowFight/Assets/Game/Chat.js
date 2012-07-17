#pragma strict

class Message {
	var time :float;
	var sender :PlayerStatus;
	var text :String;
	var meta :boolean;
	var team :boolean;
}

var chatLines :int = 6;
var lineLength :int = 50;

private var messages :Array = new Array();

private var game :GameStatus;
private var statusDisplay :GameStatusDisplay;

private var chatActive :boolean = false;
private var currMsg :String = "";

private var metaStyle :GUIStyle;

function Start () {
	statusDisplay = GetComponent(GameStatusDisplay);
	game = GetComponent(GameStatus);
	metaStyle = GUIStyle(statusDisplay.neutralStyle);
	metaStyle.normal.textColor = Color(0,0.8,0);
}

function ChatMessage (sender :PlayerStatus, text :String, team :boolean) {
	Debug.Log("ChatMessage "+text);
	networkView.RPC("NetChatMessage", RPCMode.AllBuffered, sender.networkView.viewID, text, team);
}

@RPC
function NetChatMessage (senderId :NetworkViewID, text :String, team :boolean) {
	var senderView :NetworkView = NetworkView.Find(senderId);
	if (!senderView) {
		Debug.Log("Received [NetChatMessage] for an unknown network view. ID: " + senderId);
		return;
	}
	var sender :PlayerStatus = senderView.GetComponent(PlayerStatus);
	if (!sender) {
		Debug.Log("Received [NetChatMessage] for an object that is no Player. ID: " + senderView);
		return;
	}
	var m :Message = new Message();
	m.time = Time.time;
	m.sender = sender;
	m.text = text;
	m.team = team;
	m.meta = false;
	messages.Add(m);
}

function MetaMessage (text :String) {
	var m :Message = new Message();
	m.time = Time.time;
	m.sender = null;
	m.text = text;
	m.team = false;
	m.meta = true;
	messages.Add(m);
}

function Update () {
	if (chatActive) {
	    if (Input.GetKeyUp("return")) {
			chatActive = false;
			ParseChatInput (currMsg);
			currMsg = "";
		} else if (Input.GetKeyUp("escape")) {
			chatActive = false;
		}
	} else {
		if (Input.GetKeyUp("return")) {
			chatActive = true;
		}
	}
}

function OnGUI () {
	GUI.skin.label.fontSize = 15;
	var lines :String[] = new String[chatLines];
	var styles :GUIStyle[] = new GUIStyle[chatLines];
	var i :int = messages.length-1;
	var l :int = chatLines;
	
	while (i >= 0) {
		var m :Message = messages[i] as Message;
		i--;
		if (m.time < Time.time-20) break;
		var txt :String = m.text;
		var style :GUIStyle = statusDisplay.neutralStyle;
		if (m.meta) {
			txt = ":: " + txt;
			style = metaStyle;
		} else if (m.team) {
			if (m.sender && game.playerS && game.playerS.team == m.sender.team) {
				txt = "<"+m.sender.playerName+"> " + "[Team] " + txt;
				style = statusDisplay.GetTeamStyle(m.sender.GetTeam());
			} else {
				continue;
			}
		} else {
			txt = "<"+m.sender.playerName+"> " + txt;
		}
		var neededLines :int =  txt.Length / lineLength + 1;
		l -= neededLines;
		if (l < 0) break;
		for (var ll :int = 0; ll < neededLines; ll++) {
			lines[l+ll] = (ll > 0 ? "  " : "") + (txt.Length > lineLength ? txt.Remove(lineLength) : txt);
			styles[l+ll] = style;
			txt = (txt.Length > lineLength ? txt.Substring(lineLength) : txt);
		}
	}
	
	var y :int = Screen.height - 50 - 20 * (chatLines - l);
	for (i = l; i < chatLines; i++) {
		ShadowedLabel(Rect(0,y, 700,30), lines[i], styles[i]);
		y += 20;
	}
	
//    for (var off :float = 0; off <= 1; off++) {
//	    GUILayout.BeginArea (Rect (40,Screen.height-250-off,500,201-off));
//	    for (var i :int = Mathf.Max(0, messages.length-5); i < messages.length; i++) {
//	    	if (i < messages.length - 5) break;
//	    	var m :Message = messages[i] as Message;
//	    	if (m.time < Time.time - 10) continue;
//		    //GUILayout.BeginHorizontal();
//		    if (m.meta) {
//		    	GUILayout.Box(":: " + m.text, off==1 ? metaStyle : statusDisplay.shadowStyle);
//		    } else if (!m.team || m.sender && game.playerS && game.playerS.team == m.sender.team) {
//		    	//GUILayout.Box("<"+m.sender.playerName+"> ", off==1 ? statusDisplay.GetTeamStyle(m.sender.GetTeam())
//		    	//				: statusDisplay.shadowStyle, GUILayout.ExpandHeight(true));
//		    	if (m.team) {
//			    	GUILayout.Box("<"+m.sender.playerName+"> " + "[Team] "+m.text, off==1 ?
//			    			statusDisplay.GetTeamStyle(m.sender.GetTeam()) : statusDisplay.shadowStyle);
//			    } else {
//			    	GUILayout.Box("<"+m.sender.playerName+"> " + m.text, off==1 ? statusDisplay.neutralStyle
//			    																: statusDisplay.shadowStyle);
//			    }
//		    }
//		    //GUILayout.EndHorizontal();
//	    }
//	    GUILayout.EndArea ();
//    }
    if (chatActive) {
		if (Event.current.type == EventType.KeyDown
			&& (Event.current.keyCode == KeyCode.Return
				|| Event.current.keyCode == KeyCode.Escape)) {
			if (Event.current.keyCode == KeyCode.Return) {
				chatActive = false;
				ParseChatInput (currMsg);
				currMsg = "";
			} else if (Event.current.keyCode == KeyCode.Escape) {
				Debug.Log("DeActivateChat");
				chatActive = false;
			}
	    } else {
	   		GUI.SetNextControlName("ChatInput");
		    currMsg = GUI.TextField(Rect(40,Screen.height-40,400,20), currMsg);
	    	GUI.FocusControl("ChatInput");
	    }
	}
}

function ShadowedLabel (r :Rect, text :String, style :GUIStyle) {
	GUI.Label(Rect(r.x, r.y+2, r.width, r.height), text, statusDisplay.shadowStyle);
	GUI.Label(r, text, style);
}

function ParseChatInput (inputText :String) {
	if (game.player && inputText.Length > 0) {
		var firstString : String;
		var secondString : String;
		if (inputText.StartsWith("/team ")) {
			ChatMessage (game.playerS, inputText.Substring(6), true);
		} else if (inputText.StartsWith("/killbots")) {
			KillBots();
		} else if (inputText.StartsWith("/")) {
			MetaMessage ("Valid commands:");
			MetaMessage ("/team MSG -- send message only to team members");
			MetaMessage ("/killbots -- kill all bots (only server)");
		} else {
			ChatMessage (game.playerS, inputText, false);
		}
	}
}

function KillBots() {
	if (!Network.isServer) {
		MetaMessage ("Only the server may kill the bots.");
		return;
	}
	for (var go :GameObject in GameObject.FindGameObjectsWithTag("Player")) {
		var attack = new Attack();
		attack.damage = 10000;
		go.SendMessage("ApplyDamage", attack, SendMessageOptions.DontRequireReceiver);
	}
	MetaMessage ("Killed all bots.");
}

@script RequireComponent (NetworkView)