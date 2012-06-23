private var showIngameMenu : boolean;
private var motor : CharacterMotorSF;
function Awake () {
	showIngameMenu = false;
	motor = GetComponent(CharacterMotorSF);
}

function Update() {
	if (Input.GetKeyDown(KeyCode.Escape)) {
		
		showIngameMenu = !showIngameMenu;
//		if (showIngameMenu) {
//			motor.SetControllable(false);
//		} else {
//			motor.SetControllable(true);
//		}
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
			showIngameMenu = false;
		}
	}
}
// Require a character controller to be attached to the same game object
@script RequireComponent (CharacterMotorSF)