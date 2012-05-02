#pragma strict

private var enterTime = 0.0;
private var teamNumber : int;
var points : int = 3;

function Start () {

}

function Update () {
	
}

function OnTriggerStay(other : Collider) {
	if (other.tag.Equals("SnowballBig")) {
		enterTime += Time.deltaTime;
		if (enterTime > 3.0) {
			var game = GameObject.FindGameObjectWithTag("Game");
			game.GetComponent(GameStatus).IncreaseScore(teamNumber, points);
			enterTime = 0.0;
		}
	}
}

function OnTriggerExit() {
	enterTime = 0.0;
}

function setTeamNumber(number : int) {
	teamNumber = number;
}

function getTeamNumber() : int {
	return teamNumber;
}