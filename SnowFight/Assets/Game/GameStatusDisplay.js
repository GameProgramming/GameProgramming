#pragma strict

var tabFade = 3.0;
var skyBox : UnityEngine.Material;

var status :GameStatus;

var skin : GUISkin;
private var fade = 0.0;

var distFromTop = 20;

function Awake () {
	status = GetComponent(GameStatus);
	
	if (skyBox && !RenderSettings.skybox) {
		RenderSettings.skybox = skyBox;
	}
}

function OnGUI() {

	if (skin)
		GUI.skin = skin;
	else
		Debug.Log("StartMenuGUI: GUI Skin object missing!");

	var j : int = 0;
		
	var scoreText : String = "";
	for (var t :Team in status.teams) {
		if (scoreText != "") {
			scoreText += " : ";
		}
		scoreText = scoreText + t.tickets.ToString();
	}
	GUI.Label (Rect (5, 0, 100, 35), scoreText, "winnerShadow");
	GUI.Label (Rect (5, 0, 100, 35), scoreText);
	
	if (Time.time < fade) {
		GUI.Box (Rect (10, 10, 220, 50+status.teams.length*20), "Team Frags");
		var i : int = 0;
		for (var t :Team in status.teams) {
			var teamScore :String  = t.tickets.ToString();
			GUI.Label (Rect (10, distFromTop + 20*i, 180, 25), "Team " + t.ToString() + ": ", "tickets");
			GUI.Label (Rect (200, distFromTop + 20*i, 30, 25), teamScore, "tickets");
			i++;
		}
	}
		
	if (status.gameOver && Time.time > status.gameOverTime + 2) {
		var winText : String;
		winText = "Team "+ status.winner.ToString() + " wins!";
		GUI.color = new Color(0.4, 0.4, 0.9, 0.8);
		GUI.Box(Rect(0,0,Screen.width,Screen.height),"");
		GUI.Label (Rect (Screen.width/2, Screen.height/2-98, 80, 25), winText, "winnerShadow");
		GUI.Label (Rect (Screen.width/2, Screen.height/2-100, 80, 25), winText, "winner");
			
		GUI.Box(Rect(0,0,Screen.width,Screen.height),"");
		
		GUI.Label (Rect (Screen.width/2, Screen.height/2-73, 80, 35), scoreText, "winnerShadow");
		GUI.Label (Rect (Screen.width/2, Screen.height/2-75, 80, 35), scoreText, "winner");
	}
}

function Update () {
	
	if (Input.GetKeyDown("tab")) {
		fade = Time.time + tabFade;
	}
	
	if (status.gameOver && Input.GetKeyDown("space")) {
		status.Restart();
	}
}