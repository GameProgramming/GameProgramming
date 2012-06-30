private var showIngameMenu : boolean;
private var locked : boolean = false;

function Awake () {
	showIngameMenu = false;
}

function Update() {
	if (Input.GetKeyDown(KeyCode.Escape)) {
		showIngameMenu = !showIngameMenu;
		var player : GameObject = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus).player;
		var status : PlayerStatus = player.GetComponent(PlayerStatus);
		var motor : CharacterMotorSF;
		if (status.IsMainPlayer()) {
			motor = player.GetComponent(CharacterMotorSF);
		}
		if (!locked) {
			locked = true;
			motor.canControl = false;
		} else {
			locked = false;
			motor.canControl = true;
		}
	}
}

function OnGUI () {

	if (showIngameMenu) {
		GUILayout.BeginArea(Rect (Screen.width/2 - 87.5, Screen.height/2 - 100, 175, 200));
		GUILayout.BeginVertical();
		if (Network.isServer) {
			if (GUILayout.Button ("Restart Level")) {
				var currentLevel : String = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus).GetCurrentLevel();
				var levelLoad : NetworkLevelLoad = GameObject.FindGameObjectWithTag("Main").GetComponent(NetworkLevelLoad);
				levelLoad.LoadNewLevel(currentLevel);
			}
		}
		if (GUILayout.Button ("Main Menu / Disconnect")) {
			GameObject.FindGameObjectWithTag("Main").SendMessage("Disconnect");
		}
		if (GUILayout.Button ("Exit Game")) {
			Application.Quit();
		}
//		if (GUILayout.Button ("Resume Game")) {
//			showIngameMenu = !showIngameMenu;
//		}
		GUILayout.FlexibleSpace();
		GUILayout.EndVertical();
		GUILayout.EndArea();
	}
}