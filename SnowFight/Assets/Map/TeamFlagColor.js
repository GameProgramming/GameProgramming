private var color;
private var mouseOver : boolean;

function Start () {
	mouseOver = false;
}

function Update () {
	if (!mouseOver) {
		var rend = GetComponent(MeshRenderer);
		rend.material.color = color;
	}

}

function SetColor(newColor : Color) {
	color = newColor;

	var light : Light = transform.FindChild("Spotlight").GetComponent("Light");
	light.color = newColor;

}

function OnMouseOver() {
	
	var playerStatus = GameObject.FindGameObjectWithTag("Player").GetComponent(PlayerStatus);
	if (playerStatus.IsDead()) {
		mouseOver = true;
		var rend = GetComponent(MeshRenderer);
		rend.material.color = Color.white;
	}
}

function OnMouseExit() {
	mouseOver = false;
}


function GetColor () : Color {
	return color;
}