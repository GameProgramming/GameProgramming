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
		GUI.Box(Rect (Screen.width/2 - 100, 100, 160, 300), "Menu");
		if (GUI.Button (Rect (Screen.width/2 - 90, 130, 140, 50), "Sounds")) {
			Application.Quit();
		}
		if (GUI.Button (Rect (Screen.width/2 - 90, 190, 140, 50), "Main Menu")) {
			Application.LoadLevel("Main");
		}
		if (GUI.Button (Rect (Screen.width/2 - 90, 250, 140, 50), "Exit Game")) {
			Application.Quit();
			
		}
		if (GUI.Button (Rect (Screen.width/2 - 90, 340, 140, 50), "Resume Game")) {
			showIngameMenu = !showIngameMenu;
		}
	}
}