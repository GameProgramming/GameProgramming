#pragma strict
#pragma downcast

var skyBox : UnityEngine.Material;

@System.NonSerialized
var status :GameStatus;

var skin : GUISkin;
var fontMaterial :Material;

var distFromTop = 20;

var styleTeam1 : GUIStyle;
var styleTeam2 : GUIStyle;
var neutralStyle : GUIStyle;
var shadowStyle : GUIStyle;

var teamIndicator :Texture;

function Awake () {
	status = GetComponent(GameStatus);
	
	if (skyBox && !RenderSettings.skybox) {
		RenderSettings.skybox = skyBox;
	}
}

function Start ()  {
	skin.font.material = fontMaterial;
	styleTeam1.font.material = fontMaterial;
	styleTeam2.font.material = fontMaterial;
	neutralStyle.font.material = fontMaterial;
	
	//Set the colors.
	for (var t : Team in status.teams) {
		if (t.GetTeamNumber() == 1) {
			styleTeam1.normal.textColor = t.GetColor();
		}
		if (t.GetTeamNumber() == 2) {
			styleTeam2.normal.textColor = t.GetColor();
		}
	}
	neutralStyle.normal.textColor = Color.white;
	shadowStyle = new GUIStyle(neutralStyle);
	shadowStyle.normal.textColor = Color.black;
}

function OnGUI() {
	if (!status.player) return;
	
	if (skin)
		GUI.skin = skin;
	else
		Debug.Log("StartMenuGUI: GUI Skin object missing!");

	var teams :Team[] = [status.GetTeamById(1), status.neutralTeam, status.GetTeamById(2)];

	var posX :float = 5;
	for (var t :Team in teams) {
		var posY :float = 5;
		if (t.teamNumber == 0) {
			posY += 15+30;
			GUI.Label (Rect(posX, posY, 35, 25), "  :", shadowStyle);
			GUI.Label (Rect(posX-1, posY-2, 35, 25), "  :", GetTeamStyle(t));
		} else {
			if (t == status.playerS.GetTeam()) {
				GUI.Label(Rect(posX, posY, 20,20), teamIndicator);
			} else if (status.playerS.IsDead()) {
				if (GUI.Button(Rect(posX, posY, 20,20), "o")) {
					t.AddPlayer (status.player); 
				}
			}
			posY += 15;
			GUI.Label(Rect(posX-10, posY, 35,35), t.teamIcon);
			posY += 30;
			GUI.Label (Rect(posX, posY, 35, 25), t.tickets.ToString(), shadowStyle);
			GUI.Label (Rect(posX-1, posY-2, 35, 25), t.tickets.ToString(), GetTeamStyle(t));
		}
		posY += 15;
		for (var b : Transform in t.GetAllBases()) {
			GUI.Label (Rect (posX, posY, 20, 20), t.teamBaseIcon);
			posX += 5;
			posY += 5;
		}

		posX += 20;
	}
	
	//Show the win message.
	if (status.gameOver && Time.time > status.gameOverTime + .2) {
		var winText : String;
		winText = "Team "+ status.winner.ToString() + " wins!";
		GUI.color = new Color(0.4, 0.4, 0.9, 0.8);
		GUI.Box(Rect(0, 0, Screen.width, Screen.height), "");
		if (status.winner.GetTeamNumber() == 1) {
			GUI.Label (Rect (Screen.width/2 - 105, Screen.height/2-15, 210, 30), winText, styleTeam1);
		}
		if (status.winner.GetTeamNumber() == 2) {
			GUI.Label (Rect (Screen.width/2 - 105, Screen.height/2-15, 210, 30), winText, styleTeam2);
		}		
	}
}

function GetTeamStyle (t :Team) :GUIStyle {
	if (t) {
		if (t.teamNumber == 1) return styleTeam1;
		if (t.teamNumber == 2) return styleTeam2;
	}
	return neutralStyle;
}

function GameOver () {
	yield WaitForSeconds(0.4);
	while (true) {
		if (status.gameOver && Input.GetKeyDown("space")) {
			status.Restart();
		}
		yield;
	}
}