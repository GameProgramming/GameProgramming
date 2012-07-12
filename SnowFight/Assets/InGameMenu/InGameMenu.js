private var showIngameMenu : boolean;
private var showChangeMap : boolean;
private var ingameMenuRect;
private var changeMapRect;
private var locked : boolean = false;
private var pressed : boolean = false;
private var disconnect : boolean = false;

private var showTooltips :boolean = true;
private var playerName :String = "";

var neutralStyle : GUIStyle;
var shadowStyle : GUIStyle;
var skin :GUISkin;

var fontMaterial :Material;

function Awake () {
	showIngameMenu = false;
	showChangeMap = false;
	ingameMenuRect = Rect(Screen.width/2 - 125, Screen.height/2 - 120, 250, 240);
	changeMapRect = Rect(Screen.width/2 - 125, Screen.height/2 - 30, 250, 60);
	neutralStyle.font.material = fontMaterial;
	neutralStyle.normal.textColor = Color.white;
	shadowStyle = new GUIStyle(neutralStyle);
	shadowStyle.normal.textColor = Color.black;
}

function Update() {
	if (Input.GetKeyDown(KeyCode.Escape) || pressed == true) {
		if (showChangeMap) {
			showChangeMap = false;
			showIngameMenu = true;
		} else {
			showIngameMenu = !showIngameMenu;
			var status : PlayerStatus = GameObject.
					FindGameObjectWithTag("Game").GetComponent(GameStatus).playerS;
			var input : InputController;
			if (status.IsMainPlayer()) {
				if (pressed && playerName != status.playerName) {
					status.SetName(playerName);
				} else {
					playerName = status.playerName;
				}
				input = status.gameObject.GetComponent(InputController);
				if (!locked) {
					locked = true;
					input.enabled = false;
				} else {
					locked = false;
					input.enabled = true;
				}
			}
			if (pressed) {
				GameObject.FindGameObjectWithTag("Game").SendMessage("SetTooltipActivity", showTooltips);
			}
			pressed = false;
		}
	}
	if (disconnect) {
		GameObject.FindGameObjectWithTag("Main").SendMessage("Disconnect");
	}
}

function OnGUI () {

	if (showIngameMenu) {
		GUI.skin = skin;
		
		Screen.showCursor = true;
		Screen.lockCursor = false;
//		var menuRect :Rect = Rect(ingameMenuRect);
//		menuRect.y = 
		GUILayout.Window(0, ingameMenuRect, MakeIngameMenuRect, "");
		
		if (Network.isServer) {
			var txt :String = Network.player.ipAddress.ToString() + "\n"
				+ Network.player.externalIP.ToString() + ":" + Network.player.externalPort;
			GUI.Label( Rect(Screen.width-180, Screen.height-40, 180,40), txt, shadowStyle );
			GUI.Label( Rect(Screen.width-181, Screen.height-42, 180,40), txt, neutralStyle );
		}
		
	} else {
		if (showChangeMap) {
			GUI.skin = skin;
			GUILayout.Window(1, changeMapRect, MakeChangeMenuRect, "Change Map");
		} 
	}
}

function MakeChangeMenuRect(id : int) {
	GUILayout.BeginHorizontal();
	var networkLevel : NetworkLevelLoad = GameObject.FindGameObjectWithTag("Main").GetComponent(NetworkLevelLoad);
	for (var level in networkLevel.supportedNetworkLevels) {
		if (GUILayout.Button (level)) {
			networkLevel.LoadNewLevel(level);
		}
	}
	GUILayout.EndHorizontal();
	GUILayout.BeginHorizontal();
	if (GUILayout.Button ("Back to Menu")) {
		showIngameMenu = true;
		showChangeMap = false;
	}
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();
}

function MakeIngameMenuRect(id : int) {
		GUILayout.BeginVertical();
		showTooltips = GUILayout.Toggle(showTooltips, "Show tooltips.");
		playerName = GUILayout.TextField(playerName);
		GUILayout.Space(10);
		if (Network.isServer) {
			if (GUILayout.Button ("Restart Map")) {
				GameObject.FindGameObjectWithTag("Game").SendMessage("Restart");;
			}
			if (GUILayout.Button ("Change Map")) {
				showChangeMap = true;
				showIngameMenu = false;
			}
			GUILayout.Space(10);
		}
		if (GUILayout.Button ("Disconnect")) {
			pressed = true;
			disconnect = true;
		}
		if (GUILayout.Button ("Exit Game")) {
			Application.Quit();
		}
		GUILayout.Space(10);
		if (GUILayout.Button ("Resume Game")) {
			pressed = true;
		}
		GUILayout.EndVertical();
		GUILayout.FlexibleSpace();
}

function GetShowIngameMenu() : boolean {
	return showIngameMenu;
}

function GetShowChangeMap() : boolean {
	return showChangeMap;
}