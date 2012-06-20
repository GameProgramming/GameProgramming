private var showIngameMenu : boolean;


function Start () {
	showIngameMenu = false;
}

function Update() {
	if (Input.GetKeyDown(KeyCode.Escape)) {
		showIngameMenu = !showIngameMenu;
	}
}

function OnGUI () {

	if (showIngameMenu) {
		GUI.Box(Rect (100, 100, 300, 300), "Menu");
		if (GUI.Button (Rect (110, 110, 200, 50), "Exit Game")) {
			Application.Quit();
		}
		if (GUI.Button (Rect (110, 170, 200, 50), "Restart Level")) {
			Application.LoadLevel("Main");
		}
	}
}