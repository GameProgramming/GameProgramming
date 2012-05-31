private var color;
function Start () {
	if (transform.parent.GetComponent("Team").GetTeamNumber() == 1) {
		color = Color.blue;
	}
	if (transform.parent.GetComponent("Team").GetTeamNumber() == 2) {
		color = Color.red;
	}
}

function Update () {
	var rend = GetComponent(MeshRenderer);
	rend.material.color = color;
}

function SetColor(newColor : Color) {
	color = newColor;
}

function GetColor () : Color {
	return color;
}