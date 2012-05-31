#pragma strict

private var enterTime = 0.0;
private var enterTimePlayer = 0.0;
private var team : Team;
private var color : Color;
var points : int = 3;


function Start () {
	team = transform.parent.gameObject.GetComponent(Team);
	if (team == null) {
		Debug.LogError("Could not determine TeamBase team. "+
			"(TeamBase object has to be child of Team object!)");
	}
}

function Update () {
	
}

function OnTriggerStay(other : Collider) {
	if (other.tag.Equals("BigSnowball")) {
		enterTime += Time.deltaTime;
		if (enterTime > 2.0 && other.GetComponent(BigSnowBall)) {
			// TODO:
			// ... spezialwaffe erzeugen oder so
			Debug.Log("Ball kam bei Basis von "+team.ToString()+" an.");
			other.GetComponent(BigSnowBall).Respawn();
			enterTime = 0.0;
		}
	}
	
	//Check if player.
	//If yes we want to check if he stays for 5 seconds inside the base 
	if (other.tag.Equals("Player") || other.tag.Equals("Bot")) {
		enterTimePlayer += Time.deltaTime;
		if (enterTimePlayer > 5.0) {
			enterTimePlayer = 0.0;
			var flagColor = transform.parent.GetComponentInChildren(TeamFlagColor).GetColor();
			if (flagColor == Color.gray) {
				var otherColor : Team = other.transform.parent.GetComponent(Team);
				var newColor : Color = otherColor.GetColor();
				transform.parent.GetComponentInChildren(TeamFlagColor).SetColor(newColor);
			}
			if (flagColor == Color.blue || flagColor == Color.red) {
				transform.parent.GetComponentInChildren(TeamFlagColor).SetColor(Color.gray);
			}
		}
	}
}

function OnTriggerExit(other : Collider) {
	if (other.tag.Equals("Player") || other.tag.Equals("Bot")) {
		enterTimePlayer = 0.0;
	}
}