#pragma strict
var teams = 2;
var tabFade = 3.0;

private var score : int[];
private var fade = 0.0;

function Start () {
	score = new int[teams];
	var i:int = 0;
	for (i = 0; i<teams; i++) {
		score[i] = 0;
	}
}

function OnGUI() {

	if (Time.time < fade) {
		GUI.Box (Rect (10, 10, 120, 100), "Team Frags");
		var i : int = 0;
		for (var specificScore : int in score) {
			if (i == 0) {
				var team1Score  = specificScore.ToString();
				GUI.Label (Rect (10, 40, 80, 25), "Team 1: ");
				GUI.Label (Rect (90, 40, 20, 25), team1Score);
			}
			if (i == 1) {
				var team2Score = specificScore.ToString();
				GUI.Label (Rect (10, 70, 80, 25), "Team 2: ");
				GUI.Label (Rect (90, 70, 20, 25), team2Score);
			}
			i++;
		}
	}	

}

function Update () {
	
	if (Input.GetKeyDown("tab")) {
		fade = Time.time + tabFade;
	}
	
}

function IncreaseScore(scoringTeam : int) {
	if (scoringTeam > 0)
		score[scoringTeam-1]++;
}