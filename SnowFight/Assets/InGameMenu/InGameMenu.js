private var showIngameMenu : boolean;

function Awake () {
	showIngameMenu = false;
}

function Update() {
	if (Input.GetKeyDown(KeyCode.Escape)) {
		
		showIngameMenu = !showIngameMenu;
	}
}

function OnGUI () {

	if (showIngameMenu) {
		if (Network.isServer) {
			GUI.Box(Rect (Screen.width/2 - 100, 100, 250, 300), "Menu");
			if (GUI.Button (Rect (Screen.width/2 - 90, 130, 200, 50), "RestartLevel")) {
				var currentLevel : String = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus).GetCurrentLevel();
				var levelLoad : NetworkLevelLoad = GameObject.FindGameObjectWithTag("Main").GetComponent(NetworkLevelLoad);
				levelLoad.LoadNewLevel(currentLevel);
			}
			
			if (GUI.Button (Rect (Screen.width/2 - 90, 190, 200, 50), "Main Menu / Disconnect")) {
				GameObject.FindGameObjectWithTag("Main").SendMessage("Disconnect");
			}
			if (GUI.Button (Rect (Screen.width/2 - 90, 250, 200, 50), "Exit Game")) {
				Application.Quit();
			}
			if (GUI.Button (Rect (Screen.width/2 - 90, 340, 200, 50), "Resume Game")) {
				showIngameMenu = !showIngameMenu;
			}	
		}
		GUI.Box(Rect (Screen.width/2 - 100, 100, 250, 300), "Menu");
		if (GUI.Button (Rect (Screen.width/2 - 90, 190, 200, 50), "Main Menu / Disconnect")) {
			GameObject.FindGameObjectWithTag("Main").SendMessage("Disconnect");
		}
		if (GUI.Button (Rect (Screen.width/2 - 90, 250, 200, 50), "Exit Game")) {
			Application.Quit();
			
		}
		if (GUI.Button (Rect (Screen.width/2 - 90, 340, 200, 50), "Resume Game")) {
			showIngameMenu = !showIngameMenu;
		}
	}
}