#pragma strict
var refresh = 0.0;

function Start () {
}

function Update () {
	refresh += Time.deltaTime;
	//Check which team we are and get the right color.
	if (refresh > 1.0) {
		var team : Team = transform.parent.transform.parent.GetComponent(Team);
		var light : Light = transform.GetComponent(Light);
		light.color = team.GetColor();
	}

}