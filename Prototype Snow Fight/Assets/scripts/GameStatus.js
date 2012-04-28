#pragma strict
var teams = 2;
private var score : int[];

function Start () {
	score = new int[teams];
	var i:int = 0;
	for (i = 0; i<teams; i++) {
		score[i] = 0;
	}
}

function Update () {
	//display score
}

function IncreaseScore(scoringTeam : int) {
	if (scoringTeam > 0)
		score[scoringTeam-1]++;
}