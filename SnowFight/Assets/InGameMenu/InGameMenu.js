private var showIngameMenu : boolean;
private var showChangeMap : boolean;
private var ingameMenuRect;
private var changeMapRect;
private var locked : boolean = false;
private var pressed : boolean = false;

function Awake () {
	showIngameMenu = false;
	showChangeMap = false;
	ingameMenuRect = Rect(Screen.width/2 - 125, Screen.height/2 - 75, 250, 150);
	changeMapRect = Rect(Screen.width/2 - 50, Screen.height/2 - 30, 200, 60);
}

function Update() {
	if (Input.GetKeyDown(KeyCode.Escape) || pressed == true) {
		if (showChangeMap) {
			showChangeMap = false;
			showIngameMenu = true;
		} else {
			pressed = false;
			showIngameMenu = !showIngameMenu;
			var player : GameObject = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus).player;
			var status : PlayerStatus = player.GetComponent(PlayerStatus);
			var motor : CharacterMotorSF;
			if (status.IsMainPlayer()) {
				motor = player.GetComponent(CharacterMotorSF);
				if (!locked) {
					locked = true;
					motor.canControl = false;
				} else {
					locked = false;
					motor.canControl = true;
				}
			}
		}


	}
}

function OnGUI () {

	if (showIngameMenu) {
		ingameMenuRect = GUILayout.Window(0, ingameMenuRect, MakeIngameMenuRect, "Ingame Menu");
	} else {
		if (showChangeMap) {
			changeMapRect = GUILayout.Window(1, changeMapRect, MakeChangeMenuRect, "Change Map");
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
		if (Network.isServer) {
			if (GUILayout.Button ("Restart Map")) {
				var currentLevel : String = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus).GetCurrentLevel();
				var levelLoad : NetworkLevelLoad = GameObject.FindGameObjectWithTag("Main").GetComponent(NetworkLevelLoad);
				levelLoad.LoadNewLevel(currentLevel);
			}
			if (GUILayout.Button ("Change Map")) {
				showChangeMap = true;
				showIngameMenu = false;
			}
		}
		if (GUILayout.Button ("Main Menu / Disconnect")) {
			GameObject.FindGameObjectWithTag("Main").SendMessage("Disconnect");
		}
		if (GUILayout.Button ("Exit Game")) {
			Application.Quit();
		}
		if (GUILayout.Button ("Resume Game")) {
			pressed = true;
		}
		GUILayout.EndVertical();
		GUILayout.FlexibleSpace();
}