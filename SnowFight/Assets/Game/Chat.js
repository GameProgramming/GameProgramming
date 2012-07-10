
class Message {
	var time :float;
	var sender :PlayerStatus;
	var text :String;
	var meta :boolean;
	var team :boolean;
}

private var messages :Array = new Array();

private var game :GameStatus;
private var statusDisplay :GameStatusDisplay;

private var chatActive :boolean = false;
private var currMsg :String = "";

function Start () {
	statusDisplay = GetComponent(GameStatusDisplay);
	game = GetComponent(GameStatus);
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

function MetaMessage () {
	
}

function Update () {
	if (chatActive) {
	    if (Input.GetKeyUp("return")) {
			chatActive = false;
			ParseChatInput (currMsg);
			currMsg = "";
		} else if (Input.GetKeyUp("escape")) {
			Debug.Log("DeActivateChat");
			chatActive = false;
		}
	} else {
		if (Input.GetKeyUp("return")) {
			Debug.Log("ActivateChat");
			chatActive = true;
		}
	}
}

function OnGUI () {
    for (var off :float = 0; off <= 1; off++) {
	    GUILayout.BeginArea (Rect (40,Screen.height-250-off,400,201-off));
	    for (var i :int = Mathf.Max(0, messages.length-5); i < messages.length; i++) {
	    	if (i < messages.length - 5) break;
	    	var m :Message = messages[i];
	    	if (m.time < Time.time - 10) continue;
		    //GUILayout.BeginHorizontal();
		    if (!m.team || m.sender && game.playerS && game.playerS.team == m.sender.team) {
		    	//GUILayout.Box("<"+m.sender.playerName+"> ", off==1 ? statusDisplay.GetTeamStyle(m.sender.GetTeam())
		    	//				: statusDisplay.shadowStyle, GUILayout.ExpandHeight(true));
		    	if (m.team) {
			    	GUILayout.Box("<"+m.sender.playerName+"> " + "[Team] "+m.text, off==1 ?
			    			statusDisplay.GetTeamStyle(m.sender.GetTeam()) : statusDisplay.shadowStyle);
			    } else {
			    	GUILayout.Box("<"+m.sender.playerName+"> " + m.text, off==1 ? statusDisplay.neutralStyle : statusDisplay.shadowStyle);
			    }
		    }
		    //GUILayout.EndHorizontal();
	    }
	    GUILayout.EndArea ();
    }
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

function ParseChatInput (inputText :String) {
	if (game.player && inputText.Length > 0) {
		if (inputText.StartsWith("/team ")) {
			ChatMessage (game.playerS, inputText.Substring(6), true);
		} else {
			ChatMessage (game.playerS, inputText, false);
		}
	}
}

@script RequireComponent (NetworkView)