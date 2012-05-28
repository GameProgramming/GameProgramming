#pragma strict

private var enterTime = 0.0;
private var team :Team;
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
}

function OnTriggerExit() {
	enterTime = 0.0;
}