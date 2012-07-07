//Indicates if respawn should be shown.
private var respawn : boolean;
var style : GUIStyle;
private var respawnTimer : float;

function Start () {
	respawn = false;
	style.normal.textColor = Color.white;
	respawnTimer = 3.0;
}

function Update () {
	if (respawn) {
		respawnTimer -= Time.deltaTime;
		RadialProgress.SetRadialProgress("respawning", 1-respawnTimer/3.0);
		if (respawnTimer < 0.0) {
			respawn = false;
			respawnTimer = 3.0;
			RadialProgress.SetRadialProgress("respawning", 1);
		}
	}
}

//function OnGUI () {
//	if (respawn) {
//		var respawnString = "Respawn in: ";
//		
//		if (respawnTimer >= 2.0) {
//			respawnString =  respawnString + "3";
//			GUI.Label (Rect (Screen.width/2-65, Screen.height/2, 130, 22), respawnString, style);
//		} else if (respawnTimer >= 1.0) {
//			respawnString = respawnString + "2";
//			GUI.Label (Rect (Screen.width/2-65, Screen.height/2, 130, 22), respawnString, style);
//		} else if (respawnTimer >= 0.0) {
//			respawnString = respawnString + "1";
//			GUI.Label (Rect (Screen.width/2-65, Screen.height/2, 130, 22), respawnString, style);
//		} else if (respawnTimer < 0.0) {
//			respawn = false;
//			respawnTimer = 3.0;
//		}
//	}
//}

function ActivateRespawn() {
	respawnTimer = 3.0;
	
	respawn = true;
}