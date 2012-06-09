private var color;
function Start () {
}

function Update () {
	var rend = GetComponent(MeshRenderer);
	rend.material.color = color;
}

function SetColor(newColor : Color) {
	color = newColor;

	var light : Light = transform.FindChild("Spotlight").GetComponent("Light");
	light.color = newColor;

}

function GetColor () : Color {
	return color;
}