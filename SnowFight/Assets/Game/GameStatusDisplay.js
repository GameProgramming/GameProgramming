#pragma strict
#pragma downcast

var tabFade = 3.0;
var skyBox : UnityEngine.Material;

@System.NonSerialized
var status :GameStatus;

var skin : GUISkin;
var fontMaterial :Material;
private var fade = 0.0;

var distFromTop = 20;

var styleTeam1 : GUIStyle;
var styleTeam2 : GUIStyle;
var neutralStyle : GUIStyle;
var styleTeam1Tab : GUIStyle;
var styleTeam2Tab : GUIStyle;
var neutralStyleTab : GUIStyle;

var blueCircle : Texture2D;
var redCircle : Texture2D;
var grayCircle : Texture2D;

function Awake () {
	status = GetComponent(GameStatus);
	
	if (skyBox && !RenderSettings.skybox) {
		RenderSettings.skybox = skyBox;
	}
}

function Start ()  {
	skin.font.material = fontMaterial;
	styleTeam1.font.material = fontMaterial;
	styleTeam1Tab.font.material = fontMaterial;
	styleTeam2.font.material = fontMaterial;
	styleTeam2Tab.font.material = fontMaterial;
	neutralStyle.font.material = fontMaterial;
	neutralStyleTab.font.material = fontMaterial;
}

function OnGUI() {

	//Set the colors.
	for (var t : Team in status.teams) {
		if (t.GetTeamNumber() == 1) {
			styleTeam1.normal.textColor = t.GetColor();
			styleTeam1Tab.normal.textColor = t.GetColor();
		}
		if (t.GetTeamNumber() == 2) {
			styleTeam2.normal.textColor = t.GetColor();
			styleTeam2Tab.normal.textColor = t.GetColor();
		}
	}
	neutralStyle.normal.textColor = Color.white;
	neutralStyleTab.normal.textColor = Color.white;
	
	if (skin)
		GUI.skin = skin;
	else
		Debug.Log("StartMenuGUI: GUI Skin object missing!");

	//Get tickets of team.
	var scoreTeam1 : String = "";
	var scoreTeam2 : String = "";
	for (var t : Team in status.teams) {
		if (t.GetTeamNumber() == 1) {
			scoreTeam1 = t.tickets.ToString();
		} else if (t.GetTeamNumber() == 2) {
			scoreTeam2 = t.tickets.ToString();
		}
	}
	
	//Show the tickets in the upper left corner.
	GUI.Label (Rect (20, 15, 35, 25), scoreTeam1, styleTeam1);
	GUI.Label (Rect (55, 15, 20, 25), " : ", neutralStyle);
	GUI.Label (Rect (77, 15, 35, 25), scoreTeam2, styleTeam2);
	
	var positionX : int = 20;
	
	var gos : GameObject[] = GameObject.FindGameObjectsWithTag("Team");
	
	for (var j : GameObject in gos) {
		var teamScript : Team = j.GetComponent(Team);
		if (teamScript.GetTeamNumber() == 1) {
			for (var k : Transform in j.transform) {
				if (k.CompareTag("Base")) {
					GUI.Label (Rect (positionX, 50, 25, 25), redCircle);
					positionX += 25;
				} 
			}
		}
		if (teamScript.GetTeamNumber() == 2) {
			for (var k : Transform in j.transform) {
				if (k.CompareTag("Base")) {
					GUI.Label (Rect (positionX, 50, 25, 25), blueCircle);
					positionX += 25;
				} 
			}
		}

	}
	
	var neutralTeam : GameObject = GameObject.FindGameObjectWithTag("TeamNeutral");
	for (var i : Transform in neutralTeam.transform) {
		if (i.CompareTag("Base")) {
			GUI.Label (Rect (positionX, 50, 25, 25), grayCircle);
			positionX += 25;
		}
	}
	//Show the points tab.
	if (Time.time < fade) {
		GUI.Box (Rect (120, 15, 240, 110), "Team Frags");
		var i : int = 0;
		for (var t : Team in status.teams) {
			GUI.Label (Rect (120, 45 + 30*i, 200, 30), "Team " + t.ToString() + " : ", neutralStyleTab);
			if (t.GetTeamNumber() == 1) {
				GUI.Label (Rect (320, 45 + 30*i, 30, 30), scoreTeam1, styleTeam1Tab);
			}
			if (t.GetTeamNumber() == 2) {
				GUI.Label (Rect (320, 45 + 30*i, 30, 30), scoreTeam2, styleTeam2Tab);
			}
			i++;
		}
	}
		
	//Show the win message.
	if (status.gameOver && Time.time > status.gameOverTime + 2) {
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

function Update () {
	
	if (Input.GetKeyDown("tab")) {
		fade = Time.time + tabFade;
	}
	
	if (status.gameOver && Input.GetKeyDown("space")) {
		status.Restart();
	}
}