#pragma strict
var teams = 2;
private var score = new Array();

function Start () {
	score.length = teams;
	var i:int;
	for (i = 0; i<teams; i++) {
		score[i] = 0;
	}
}

function Update () {
	//display score
}

function IncreaseScore(scoringTeam : int) {
	//score[scoringTeam] ++;
}