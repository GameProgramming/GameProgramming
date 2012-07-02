private var showIngameMenu : boolean;
private var ingameMenuRect;
private var locked : boolean = false;
private var pressed : boolean = false;

function Awake () {
	showIngameMenu = false;
	ingameMenuRect = Rect(Screen.width/2 - 125, Screen.height/2 - 75, 250, 150);
}

function Update() {
	if (Input.GetKeyDown(KeyCode.Escape) || pressed == true) {
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

function OnGUI () {

	if (showIngameMenu) {
		ingameMenuRect = GUILayout.Window(0, ingameMenuRect, MakeIngameMenuRect, "Ingame Menu");
	}
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
				//Do something here.
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